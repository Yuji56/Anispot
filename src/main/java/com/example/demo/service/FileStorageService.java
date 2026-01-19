package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        try {
            // アップロードディレクトリの作成
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // ファイル名の生成（重複を避けるためUUIDを使用）
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // ファイルの保存
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 保存されたファイルのURLまたはパスを返す
            return "/uploads/" + filename;

        } catch (IOException ex) {
            throw new RuntimeException("ファイルの保存に失敗しました: " + file.getOriginalFilename(), ex);
        }
    }
}