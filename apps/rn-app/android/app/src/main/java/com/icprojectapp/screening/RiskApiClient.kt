package com.icprojectapp.screening

import android.util.Log
import com.icprojectapp.BuildConfig
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class RiskLookupResult(val score: Int, val level: String)

object RiskApiClient {

    private const val TAG = "RiskApiClient"

    // Hub API base URL — set via BuildConfig in app/build.gradle
    private val BASE_URL: String get() = BuildConfig.HUB_API_URL

    /**
     * Synchronous call — run from a coroutine (IO dispatcher).
     * Throws on network error or non-2xx response.
     */
    fun lookup(phone: String): RiskLookupResult {
        val encodedPhone = URLEncoder.encode(phone, "UTF-8")
        val url = URL("$BASE_URL/risk/lookup?phone=$encodedPhone")
        val conn = url.openConnection() as HttpURLConnection
        conn.apply {
            requestMethod    = "GET"
            connectTimeout   = 500
            readTimeout      = 700
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "ScamShield-Android/1.0")
        }
        try {
            val code = conn.responseCode
            if (code != 200) throw Exception("HTTP $code")
            val body = conn.inputStream.bufferedReader().readText()
            val json = JSONObject(body)
            return RiskLookupResult(
                score = json.getInt("score"),
                level = json.getString("level"),
            )
        } finally {
            conn.disconnect()
        }
    }
}
