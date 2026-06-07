package com.example.util;

import java.util.Objects;

/**
 * 问候功能 —— 纯函数，无副作用。
 *
 * <p>输入姓名返回中文问候语，自动处理 null/空串/超长边界。</p>
 */
public final class GreetFunction {

    private static final String DEFAULT_NAME = "匿名用户";
    private static final int MAX_LENGTH = 100;

    private GreetFunction() {
        // utility class, prevent instantiation
    }

    /**
     * 生成中文问候语。
     *
     * @param name 用户名，可为 null
     * @return "你好，{name}" 格式的问候语，name 为 null 或空串时替换为 "匿名用户"，
     *         超长时截断至前 100 个字符
     */
    public static String greet(String name) {
        // Step 1: null 安全转换 (null -> "")
        String safeName = Objects.toString(name, "");
        // Step 2: 空串替换
        if (safeName.isEmpty()) {
            safeName = DEFAULT_NAME;
        }
        // Step 3: 超长截断
        if (safeName.length() > MAX_LENGTH) {
            safeName = safeName.substring(0, MAX_LENGTH);
        }
        // Step 4: 拼接问候语
        return "你好，" + safeName;
    }
}
