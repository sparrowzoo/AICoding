package com.example.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class GreetFunctionTest {

    @Test
    void shouldGreetWithName() {
        assertEquals("你好，张三", GreetFunction.greet("张三"));
    }

    @Test
    void shouldDefaultToAnonymousWhenEmpty() {
        assertEquals("你好，匿名用户", GreetFunction.greet(""));
    }

    @Test
    void shouldDefaultToAnonymousWhenNull() {
        assertEquals("你好，匿名用户", GreetFunction.greet(null));
    }

    @Test
    void shouldTruncateWhenTooLong() {
        String longInput = "a".repeat(101);
        String expectedName = "a".repeat(100);
        assertEquals("你好，" + expectedName, GreetFunction.greet(longInput));
    }

    @Test
    void shouldNotTruncateWhenExactly100() {
        String input = "a".repeat(100);
        assertEquals("你好，" + input, GreetFunction.greet(input));
    }
}
