# Sparrow 接口返回协议示例

此例展示历史项目中 Sparrow 的返回结构。具体项目先核对框架版本和现有返回类型。下方 `fail` 等方法体省略，仅用于阅读已有字段含义。

接口返回协议基类
```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.sparrow.protocol;

import com.sparrow.protocol.constant.Constant;
import com.sparrow.protocol.constant.SparrowError;
import lombok.Data;

import java.util.Map;

/**
 * 可用于协议 规范服务端返回格式 <p>
 * <p>
 * 与异常相比 考虑继承的问题 枚举不可以继承
 * ErrorSupport
 * <p>
 * 考虑该类要求稳定不经常修改 不要影响数据协议 pure function JDK ddd (VO)
 * <p>
 * DCL
 * 为保证线程安全，属性只读
 */
@Data
public class Result<T> implements DTO {
    private Result() {

    }

    /**
     * 成功返回有效数据
     *
     * @param data
     */
    public Result(T data) {
        if (data instanceof ErrorSupport) {
            ErrorSupport error = (ErrorSupport) data;
            this.code = error.getCode();
            this.key = error.name().toLowerCase();
            this.message = error.getMessage();
        } else {
            this.code = Constant.RESULT_OK_CODE;
            this.data = data;
            this.message = Constant.SUCCESS;
        }
    }

    /**
     * 成功返回有效数据
     * 开闭原则 SPI
     *
     * @param data 数据
     * @param key  i18n key
     */
    public Result(T data, String key) {
        this.code = Constant.RESULT_OK_CODE;
        this.data = data;
        this.key = key;
        this.message = Constant.SUCCESS;
    }

    public static <T> Result success(T data, String instruction) {
        Result result = new Result(data);
        result.instruction = instruction;
        return result;
    }

    /**
     * 初始化默认成功
     * 这个对象是在什么时侯用呢？
     */
    private static volatile Result ok;

    /**
     * 默认成功 GC FREE
     * DCL 解决容器加载顺序的问题：
     * 因为static 是在jvm启动的时侯加载的
     * 而spring 是在其后加载的
     * <p>
     * 实际是static 懒加载，用的时侯才执行
     *
     * @return
     */
    public static Result success() {
        if (ok != null) {
            return ok;
        }
        synchronized (Result.class) {
            if (ok != null) {
                return ok;
            }
            ok = success(Constant.SUCCESS);
            return ok;
        }
    }


    /**
     * 返回有message的默认成功
     *
     * @param message
     * @return
     */
    public static Result success(String message) {
        Result result = new Result("");
        result.message = message;
        return result;
    }


    private static volatile Result systemServerError;


    /**
     * 错误编码
     */
    private String code;

    /**
     * 错误key
     */
    private String key;
    /**
     * 错误文本 需要业务自定义获取错误信息获取器
     */
    private String message;

    /**
     * 指令 用于websocket 返回指令
     */
    private String instruction;
    /**
     * 返回值
     */
    private T data;

    private Map<String, String> parameters;


    public static Result fail(ErrorSupport errorSupport) {
    }

    private static Result fail(BusinessException business) {

    }

    public static Result fail(Exception business) {
    }

    public static Result fail() {
    }

    public T getData() {
        return this.data;
    }

    public boolean isSuccess() {
        return this.code.equals(Constant.RESULT_OK_CODE);
    }
}

```
