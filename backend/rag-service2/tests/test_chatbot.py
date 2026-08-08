"""
tests/test_chatbot.py

Unit test for ChatService orchestration.
"""

import unittest
from services.chat_service import ChatService


class TestChatbot(unittest.TestCase):

    def test_chat_service_instantiation(self):
        service = ChatService()
        self.assertIsNotNone(service.intent_classifier)


if __name__ == "__main__":
    unittest.main()