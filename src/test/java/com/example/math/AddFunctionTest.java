package com.example.math;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AddFunctionTest {

    private final AddFunction addFunction = new AddFunction();

    @Test
    @DisplayName("1+1=2 核心场景")
    void onePlusOne_equalsTwo() {
        assertEquals(2, addFunction.add(1, 1));
    }

    @Test
    @DisplayName("0+0=0")
    void zeroPlusZero_equalsZero() {
        assertEquals(0, addFunction.add(0, 0));
    }

    @Test
    @DisplayName("0 是加法单位元")
    void zeroIsIdentity() {
        assertEquals(5, addFunction.add(5, 0));
        assertEquals(5, addFunction.add(0, 5));
    }

    @Test
    @DisplayName("正数加正数")
    void positivePlusPositive() {
        assertEquals(7, addFunction.add(3, 4));
    }

    @Test
    @DisplayName("正数加负数")
    void positivePlusNegative() {
        assertEquals(1, addFunction.add(3, -2));
    }

    @Test
    @DisplayName("负数加负数")
    void negativePlusNegative() {
        assertEquals(-5, addFunction.add(-2, -3));
    }

    @Test
    @DisplayName("相反数相加为 0")
    void oppositeNumbers_sumToZero() {
        assertEquals(0, addFunction.add(5, -5));
    }

    @Test
    @DisplayName("满足交换律")
    void commutative() {
        assertEquals(addFunction.add(8, 3), addFunction.add(3, 8));
    }

    @Test
    @DisplayName("大整数相加")
    void largeValues() {
        assertEquals(2_000_000_000, addFunction.add(1_000_000_000, 1_000_000_000));
    }

    @Test
    @DisplayName("整数溢出边界：MAX_VALUE+1 回绕为 MIN_VALUE")
    void overflow_wrapsAround() {
        assertEquals(Integer.MIN_VALUE, addFunction.add(Integer.MAX_VALUE, 1));
    }
}
