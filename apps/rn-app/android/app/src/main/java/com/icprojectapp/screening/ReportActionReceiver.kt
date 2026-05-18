package com.icprojectapp.screening

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class ReportActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val phone = intent.getStringExtra("phone") ?: return
        Log.d("ReportActionReceiver", "Report tapped for: $phone")

        // Launch main app to ReportScreen with pre-filled phone number
        val launchIntent = context.packageManager
            .getLaunchIntentForPackage(context.packageName)
            ?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
                putExtra("report_phone", phone)
                putExtra("deep_link", "report")
            }
        launchIntent?.let { context.startActivity(it) }
    }
}
