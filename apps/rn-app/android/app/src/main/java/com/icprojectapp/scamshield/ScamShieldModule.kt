package com.icprojectapp.scamshield

import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.CallLog
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ScamShieldModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ScamShield"

    /**
     * Fetches recent call log entries from Android CallLog provider.
     * Requires READ_CALL_LOG permission granted at runtime.
     */
    @ReactMethod
    fun getCallHistory(limit: Int, promise: Promise) {
        try {
            val calls: WritableArray = Arguments.createArray()
            val projection = arrayOf(
                CallLog.Calls._ID,
                CallLog.Calls.NUMBER,
                CallLog.Calls.DATE,
                CallLog.Calls.DURATION,
                CallLog.Calls.TYPE,
                CallLog.Calls.CACHED_NAME,
            )
            val cursor: Cursor? = reactContext.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection,
                null,
                null,
                "${CallLog.Calls.DATE} DESC LIMIT $limit"
            )
            cursor?.use { c ->
                val idIdx       = c.getColumnIndex(CallLog.Calls._ID)
                val numIdx      = c.getColumnIndex(CallLog.Calls.NUMBER)
                val dateIdx     = c.getColumnIndex(CallLog.Calls.DATE)
                val durIdx      = c.getColumnIndex(CallLog.Calls.DURATION)
                val typeIdx     = c.getColumnIndex(CallLog.Calls.TYPE)
                val nameIdx     = c.getColumnIndex(CallLog.Calls.CACHED_NAME)
                val sdf         = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)

                while (c.moveToNext()) {
                    val entry: WritableMap = Arguments.createMap()
                    entry.putString("id",       c.getString(idIdx) ?: "")
                    entry.putString("phone",    c.getString(numIdx) ?: "")
                    entry.putString("date",     sdf.format(Date(c.getLong(dateIdx))))
                    entry.putInt("duration",    c.getInt(durIdx))
                    entry.putInt("type",        c.getInt(typeIdx))
                    entry.putString("name",     c.getString(nameIdx) ?: "")
                    calls.pushMap(entry)
                }
            }
            promise.resolve(calls)
        } catch (e: SecurityException) {
            promise.reject("ERR_PERMISSION", "READ_CALL_LOG permission not granted", e)
        } catch (e: Exception) {
            promise.reject("ERR_CALL_HISTORY", e.message, e)
        }
    }

    /**
     * Opens Android system dialer settings for call screening configuration.
     */
    @ReactMethod
    fun openCallScreeningSettings(promise: Promise) {
        try {
            val intent = Intent(android.telecom.TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_OPEN_SETTINGS", e.message, e)
        }
    }

    /**
     * Opens Android notification settings for the app.
     */
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        try {
            val intent = Intent().apply {
                action = "android.settings.APP_NOTIFICATION_SETTINGS"
                putExtra("app_package", reactContext.packageName)
                putExtra("android.provider.extra.APP_PACKAGE", reactContext.packageName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_OPEN_NOTIFICATION_SETTINGS", e.message, e)
        }
    }

    /**
     * Returns the current app version name and code.
     */
    @ReactMethod
    fun getAppVersion(promise: Promise) {
        try {
            val pInfo = reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
            val result: WritableMap = Arguments.createMap()
            result.putString("versionName", pInfo.versionName)
            result.putDouble("versionCode", pInfo.longVersionCode.toDouble())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_APP_VERSION", e.message, e)
        }
    }

    /**
     * Dials a phone number via Android system Intent.
     * Used for the VNCERT hotline button.
     */
    @ReactMethod
    fun dialPhone(phoneNumber: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_DIAL", e.message, e)
        }
    }
}
