package com.icprojectapp.screening

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

data class CachedRiskEntry(val score: Int, val level: String, val cachedAt: Long)

/**
 * SharedPreferences-backed risk score cache with 1-hour TTL.
 * Will be replaced by MMKV in the offline-first-cache skill for lower latency.
 */
object RiskLocalCache {

    private const val PREFS_NAME = "scamshield_risk_cache"
    private const val TTL_MS = 60 * 60 * 1000L  // 1 hour

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun get(phone: String): CachedRiskEntry? {
        if (!::prefs.isInitialized) return null
        val raw = prefs.getString(phone, null) ?: return null
        return try {
            val obj = JSONObject(raw)
            val cachedAt = obj.getLong("cachedAt")
            if (System.currentTimeMillis() - cachedAt > TTL_MS) {
                prefs.edit().remove(phone).apply()
                return null
            }
            CachedRiskEntry(
                score    = obj.getInt("score"),
                level    = obj.getString("level"),
                cachedAt = cachedAt,
            )
        } catch (e: Exception) {
            null
        }
    }

    fun put(phone: String, score: Int, level: String) {
        if (!::prefs.isInitialized) return
        val obj = JSONObject().apply {
            put("score",    score)
            put("level",    level)
            put("cachedAt", System.currentTimeMillis())
        }
        prefs.edit().putString(phone, obj.toString()).apply()
    }
}
