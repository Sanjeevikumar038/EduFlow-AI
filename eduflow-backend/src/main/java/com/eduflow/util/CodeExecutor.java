package com.eduflow.util;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class CodeExecutor {
    private static final String TEMP_DIR = "temp_compile";

    public static List<Map<String, Object>> runTestCases(String language, String code, List<Map<String, String>> testCases) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        // Use relative path inside the workspace for safety
        Path workingDir = Paths.get(TEMP_DIR).toAbsolutePath();
        try {
            Files.createDirectories(workingDir);
        } catch (IOException e) {
            // fallback
        }

        String fileName = "";
        String compileCmd = null;
        String runCmd = null;

        if ("python".equalsIgnoreCase(language)) {
            fileName = "solution.py";
            if (isCommandAvailable("python3")) {
                runCmd = "python3 solution.py";
            } else {
                runCmd = "python solution.py";
            }
        } else if ("java".equalsIgnoreCase(language)) {
            fileName = "Solution.java";
            compileCmd = "javac Solution.java";
            runCmd = "java Solution";
        } else if ("cpp".equalsIgnoreCase(language)) {
            fileName = "solution.cpp";
            compileCmd = "g++ -O3 -o solution_cpp solution.cpp";
            runCmd = "./solution_cpp";
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                runCmd = "solution_cpp.exe";
            }
        } else if ("c".equalsIgnoreCase(language)) {
            fileName = "solution.c";
            compileCmd = "gcc -O3 -o solution_c solution.c";
            runCmd = "./solution_c";
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                runCmd = "solution_c.exe";
            }
        }

        File codeFile = new File(workingDir.toFile(), fileName);
        try {
            Files.writeString(codeFile.toPath(), code);
        } catch (IOException e) {
            // failed to write
        }

        // Compilation step
        String compileError = null;
        if (compileCmd != null) {
            try {
                String[] compileTokens = compileCmd.split(" ");
                ProcessBuilder pb = new ProcessBuilder(compileTokens);
                pb.directory(workingDir.toFile());
                Process process = pb.start();
                process.waitFor(10, TimeUnit.SECONDS);
                if (process.exitValue() != 0) {
                    compileError = readStream(process.getErrorStream());
                }
            } catch (Exception e) {
                compileError = "Compilation failed: " + e.getMessage();
            }
        }

        for (Map<String, String> tc : testCases) {
            Map<String, Object> result = new HashMap<>();
            String input = tc.get("input");
            String expected = tc.get("expected");
            if (expected == null) {
                expected = tc.get("expectedOutput");
            }
            if (expected == null) {
                expected = "";
            }
            result.put("input", input);
            result.put("expected", expected);

            if (compileError != null) {
                result.put("passed", false);
                result.put("output", "");
                result.put("error", compileError);
                results.add(result);
                continue;
            }

            try {
                String[] runTokens = runCmd.split(" ");
                ProcessBuilder pb = new ProcessBuilder(runTokens);
                pb.directory(workingDir.toFile());
                Process process = pb.start();

                // Feed input into stdin
                if (input != null && !input.isEmpty()) {
                    try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                        writer.write(input);
                        writer.flush();
                    }
                }

                boolean finished = process.waitFor(2, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    result.put("passed", false);
                    result.put("output", "");
                    result.put("error", "Time Limit Exceeded (TLE)");
                } else {
                    String output = readStream(process.getInputStream()).trim();
                    String error = readStream(process.getErrorStream()).trim();
                    
                    if (process.exitValue() != 0) {
                        result.put("passed", false);
                        result.put("output", output);
                        result.put("error", error.isEmpty() ? "Runtime Error" : error);
                    } else {
                        boolean passed = output.equalsIgnoreCase(expected.trim());
                        result.put("passed", passed);
                        result.put("output", output);
                        result.put("error", error.isEmpty() ? null : error);
                    }
                }
            } catch (Exception e) {
                result.put("passed", false);
                result.put("output", "");
                result.put("error", "Execution failed: " + e.getMessage());
            }
            results.add(result);
        }

        // Clean up temporary files
        try {
            Files.deleteIfExists(codeFile.toPath());
            if ("java".equalsIgnoreCase(language)) {
                Files.deleteIfExists(workingDir.resolve("Solution.class"));
            } else if ("cpp".equalsIgnoreCase(language)) {
                Files.deleteIfExists(workingDir.resolve("solution_cpp"));
                Files.deleteIfExists(workingDir.resolve("solution_cpp.exe"));
            } else if ("c".equalsIgnoreCase(language)) {
                Files.deleteIfExists(workingDir.resolve("solution_c"));
                Files.deleteIfExists(workingDir.resolve("solution_c.exe"));
            }
        } catch (IOException e) {}

        return results;
    }

    private static boolean isCommandAvailable(String cmd) {
        try {
            Process p = new ProcessBuilder(cmd, "--version").start();
            p.waitFor(1, TimeUnit.SECONDS);
            return p.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private static String readStream(InputStream is) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        } catch (IOException e) {}
        return sb.toString().trim();
    }
}
