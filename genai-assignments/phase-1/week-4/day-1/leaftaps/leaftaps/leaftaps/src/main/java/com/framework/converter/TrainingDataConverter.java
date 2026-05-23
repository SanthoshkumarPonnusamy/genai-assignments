package com.framework.converter;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.json.JSONArray;
import org.json.JSONObject;

public class TrainingDataConverter {
    
    public static class ParseResult {
        public final String html;
        public final String java;
        
        public ParseResult(String html, String java) {
            this.html = html;
            this.java = java;
        }
    }
    
    public static ParseResult parseExample(Path filePath) throws IOException {
        String content = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
        
        String[] htmlParts = content.split("===HTML===");
        if (htmlParts.length < 2) {
            throw new IllegalArgumentException("The input file " + filePath + " must contain '===HTML===' marker.");
        }
        
        String[] javaParts = htmlParts[1].split("===JAVA===");
        if (javaParts.length < 2) {
            throw new IllegalArgumentException("The input file " + filePath + " must contain '===JAVA===' marker.");
        }
        
        return new ParseResult(javaParts[0].trim(), javaParts[1].trim());
    }
    
    public static JSONObject createJsonLine(String html, String java) {
        String systemMessage = "You are an expert in generating Selenium Java page object classes using provided DOM information. " +
                "Follow the framework's guidelines: use SeleniumBase wrapper methods, proper locators, and insert TODO comments if a mapping is missing. Make sure every page method includes comments in your generated code as the training examples may not have comments";
        
        String userMessage = "Given the following DOM structure:\n```html\n" + html + "\n```\n" +
                "Generate a Selenium Java page object class for this DOM.";
        
        JSONObject jsonObj = new JSONObject();
        JSONArray messages = new JSONArray();
        
        messages.put(new JSONObject().put("role", "system").put("content", systemMessage));
        messages.put(new JSONObject().put("role", "user").put("content", userMessage));
        messages.put(new JSONObject().put("role", "assistant").put("content", java));
        
        jsonObj.put("messages", messages);
        
        return jsonObj;
    }
    
    public static void main(String[] args) {
        // Adjusted paths to match your specific locations
        String inputDir = "E:\\Santhosh\\genai-assignments\\phase-1\\week-4\\day-1\\training\\training";
        String outputFile = "E:\\Santhosh\\genai-assignments\\phase-1\\week-4\\day-1\\training\\training\\training_data_chat.jsonl";
        
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(Paths.get(inputDir), "*.txt");
             BufferedWriter writer = Files.newBufferedWriter(Paths.get(outputFile), 
                     StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND)) {
            
            for (Path inputFile : stream) {
                try {
                    ParseResult result = parseExample(inputFile);
                    JSONObject jsonObj = createJsonLine(result.html, result.java);
                    writer.write(jsonObj.toString());
                    writer.newLine();
                    System.out.println("Processed " + inputFile.getFileName());
                } catch (IllegalArgumentException e) {
                    System.out.println("Skipping " + inputFile.getFileName() + ": " + e.getMessage());
                } catch (IOException e) {
                    System.out.println("Error processing " + inputFile.getFileName() + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.err.println("Error processing files: " + e.getMessage());
        }
        
        System.out.println("Conversion complete. Output saved to: " + outputFile);
    }
}