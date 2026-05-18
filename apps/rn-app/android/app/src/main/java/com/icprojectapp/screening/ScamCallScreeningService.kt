package com.icprojectapp.screening

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull

@RequiresApi(Build.VERSION_CODES.Q)
class ScamCallScreeningService : CallScreeningService() {

    private val TAG = "ScamCallScreening"
    private val CHANNEL_ID = "scam_warning_channel"
    private val NOTIF_ID_BASE = 900_000

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onCreate() {
        super.onCreate()
        RiskLocalCache.init(applicationContext)
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val rawPhone = callDetails.handle?.schemeSpecificPart
        if (rawPhone.isNullOrBlank()) {
            allowCall(callDetails)
            return
        }

        // Strip leading + for lookup key consistency
        val phone = rawPhone.trimStart('+')
        Log.d(TAG, "Screening call from: $phone")

        scope.launch {
            val score = lookupRiskScore(phone)
            Log.d(TAG, "Risk score for $phone: $score")

            withContext(Dispatchers.Main) {
                if (score >= 60) {
                    showWarningNotification(rawPhone, score)
                }
                // MVP policy: always allow — we warn, never block
                allowCall(callDetails)
            }
        }
    }

    // ----- Risk lookup: cache-first, API fallback, 900ms total timeout -----

    private suspend fun lookupRiskScore(phone: String): Int =
        withTimeoutOrNull(900L) {
            // 1. Check local cache (< 5ms via SharedPreferences)
            val cached = RiskLocalCache.get(phone)
            if (cached != null) {
                Log.d(TAG, "Cache HIT: $phone → score=${cached.score}")
                return@withTimeoutOrNull cached.score
            }

            // 2. API lookup (max 700ms read timeout in RiskApiClient)
            try {
                val result = RiskApiClient.lookup(phone)
                RiskLocalCache.put(phone, result.score, result.level)
                result.score
            } catch (e: Exception) {
                Log.w(TAG, "API lookup failed for $phone: ${e.message}")
                0  // Safe default on error
            }
        } ?: run {
            Log.w(TAG, "Risk lookup timed out for $phone — treating as safe")
            0
        }

    // ----- Helpers -----

    private fun allowCall(details: Call.Details) {
        respondToCall(
            details,
            CallResponse.Builder()
                .setDisallowCall(false)
                .setRejectCall(false)
                .setSilenceCall(false)
                .build(),
        )
    }

    private fun showWarningNotification(phone: String, score: Int) {
        val nm = getSystemService(NotificationManager::class.java)
        ensureChannel(nm)

        val levelLabel = when {
            score >= 80 -> "NGUY HIỂM"
            else        -> "RỦI RO CAO"
        }

        val reportIntent = Intent(this, ReportActionReceiver::class.java)
            .putExtra("phone", phone)
        val reportPending = PendingIntent.getBroadcast(
            this,
            phone.hashCode(),
            reportIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("⚠ Cuộc gọi $levelLabel ($score/100)")
            .setContentText("Đừng chuyển tiền! Kiểm tra kỹ trước khi nghe máy.")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Số $phone có điểm rủi ro $score/100.\nĐừng chuyển tiền, cung cấp OTP, hay làm theo hướng dẫn của người lạ.")
            )
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_menu_report_image, "Báo cáo số này", reportPending)
            .setAutoCancel(true)
            .build()

        nm.notify(NOTIF_ID_BASE + phone.hashCode(), notification)
    }

    private fun ensureChannel(nm: NotificationManager) {
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Cảnh báo cuộc gọi lừa đảo",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = "Hiện cảnh báo ngay khi phát hiện cuộc gọi có rủi ro cao"
            enableVibration(true)
            setShowBadge(true)
        }
        nm.createNotificationChannel(channel)
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
