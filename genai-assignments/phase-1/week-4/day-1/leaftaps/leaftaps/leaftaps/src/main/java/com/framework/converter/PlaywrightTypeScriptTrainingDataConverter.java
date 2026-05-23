package com.framework.converter;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONObject;

public class PlaywrightTypeScriptTrainingDataConverter {

    private static final String HTML_MARKER = "===HTML===";
    private static final String CODE_MARKER = "===TYPESCRIPT===";
    private static final String TARGET_LANGUAGE = "Playwright TypeScript";

    public static class ParseResult {
        public final String html;
        public final String code;

        public ParseResult(String html, String code) {
            this.html = html;
            this.code = code;
        }
    }

    public static ParseResult parseExample(Path filePath) throws IOException {
        String content = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);

        String[] htmlParts = content.split(Pattern.quote(HTML_MARKER), 2);
        if (htmlParts.length < 2) {
            throw new IllegalArgumentException("The input file " + filePath + " must contain '" + HTML_MARKER + "' marker.");
        }

        String[] codeParts = htmlParts[1].split(Pattern.quote(CODE_MARKER), 2);
        if (codeParts.length < 2) {
            throw new IllegalArgumentException("The input file " + filePath + " must contain '" + CODE_MARKER + "' marker.");
        }

        return new ParseResult(codeParts[0].trim(), codeParts[1].trim());
    }

    public static JSONObject createJsonLine(String html, String code) {
        String systemMessage = "You are an expert in generating Playwright TypeScript page object classes using provided DOM information. Use @playwright/test conventions, proper locators, async methods, and insert TODO comments only when a mapping is missing. Make sure every page method includes comments in the generated code. Generate only code grounded in the supplied DOM.";

        String userMessage = "Given the following DOM structure:\n```html\n" + html + "\n```\n" +
                "Generate a Playwright TypeScript page object class for this DOM.";

        JSONObject jsonObj = new JSONObject();
        JSONArray messages = new JSONArray();

        messages.put(new JSONObject().put("role", "system").put("content", systemMessage));
        messages.put(new JSONObject().put("role", "user").put("content", userMessage));
        messages.put(new JSONObject().put("role", "assistant").put("content", code));

        jsonObj.put("messages", messages);
        return jsonObj;
    }

    public static void main(String[] args) {
        String inputDir = args.length > 0 ? args[0] : "C:\\Users\\Sudarshan R\\Desktop\\Training\\fine-tuning\\playwright-typescript-training\\training";
        String outputFile = args.length > 1 ? args[1] : "C:\\Users\\Sudarshan R\\Desktop\\Training\\fine-tuning\\playwright-typescript-training\\training_data.jsonl";

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(Paths.get(inputDir), "*.txt");
             BufferedWriter writer = Files.newBufferedWriter(
                     Paths.get(outputFile),
                     StandardCharsets.UTF_8,
                     StandardOpenOption.CREATE,
                     StandardOpenOption.TRUNCATE_EXISTING)) {

            for (Path inputFile : stream) {
                try {
                    ParseResult result = parseExample(inputFile);
                    JSONObject jsonObj = createJsonLine(result.html, result.code);
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
