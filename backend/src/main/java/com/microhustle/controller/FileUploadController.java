package com.microhustle.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        System.out.println("File upload request received");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("File content type: " + file.getContentType());
        
        if (file.isEmpty()) {
            System.out.println("File is empty");
            return ResponseEntity.badRequest().body("No file selected");
        }
        try {
            String filename = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("Upload path: " + uploadPath.toAbsolutePath());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory");
            }
            Path filePath = uploadPath.resolve(filename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());
            file.transferTo(filePath);
            String fileUrl = "/uploads/" + filename;
            System.out.println("File saved successfully: " + fileUrl);
            return ResponseEntity.ok().body(fileUrl);
        } catch (IOException e) {
            System.err.println("File upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed: " + e.getMessage());
        }
    }
}
