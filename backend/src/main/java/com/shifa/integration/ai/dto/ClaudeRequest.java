package com.shifa.integration.ai.dto;

import java.util.List;

public class ClaudeRequest {

    private String model;
    private int maxTokens;
    private double temperature;
    private String system;
    private List<Message> messages;

    public String getModel() {
        return model;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public double getTemperature() {
        return temperature;
    }

    public String getSystem() {
        return system;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setMaxTokens(int maxTokens) {
        this.maxTokens = maxTokens;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private final ClaudeRequest target = new ClaudeRequest();

        public Builder model(String model) {
            target.model = model;
            return this;
        }

        public Builder maxTokens(int maxTokens) {
            target.maxTokens = maxTokens;
            return this;
        }

        public Builder temperature(double temperature) {
            target.temperature = temperature;
            return this;
        }

        public Builder system(String system) {
            target.system = system;
            return this;
        }

        public Builder messages(List<Message> messages) {
            target.messages = messages;
            return this;
        }

        public ClaudeRequest build() {
            return target;
        }
    }

    public static class Message {
        private String role;
        private String content;

        public String getRole() {
            return role;
        }

        public String getContent() {
            return content;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public static MessageBuilder builder() {
            return new MessageBuilder();
        }

        public static final class MessageBuilder {
            private final Message target = new Message();

            public MessageBuilder role(String role) {
                target.role = role;
                return this;
            }

            public MessageBuilder content(String content) {
                target.content = content;
                return this;
            }

            public Message build() {
                return target;
            }
        }
    }
}
