package com.example.demo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource; // 追加

import java.io.IOException;
import java.io.InputStream; // 追加

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // 【修正】ClassPathResourceを使って読み込む（これなら確実です）
        // ※ファイル名が間違っていないか再確認してください
        ClassPathResource resource = new ClassPathResource("myappanispot-firebase-adminsdk-fbsvc-285c3b4cf8.json");
        
        // ファイルが開けるかチェック
        if (!resource.exists()) {
            throw new IOException("FirebaseのJSONファイルが見つかりません: " + resource.getPath());
        }

        try (InputStream serviceAccount = resource.getInputStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket("myappanispot.appspot.com") 
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            }
            return FirebaseApp.getInstance();
        }
    }
}