"""
tests/test_prompt_builder.py

Unit test for PromptBuilder.
"""

import unittest
from services.prompt_builder import PromptBuilder
from langchain_core.documents import Document


class TestPromptBuilder(unittest.TestCase):

    def test_build_prompt(self):
        builder = PromptBuilder()
        doc = Document(page_content="Patient diagnosed with acute bronchitis.", metadata={"type": "visit"})
        prompt = builder.build(
            question="What is the diagnosis?",
            documents=[doc],
            conversation_history="User:\nHello"
        )
        self.assertIn("STRICT RULES", prompt)
        self.assertIn("acute bronchitis", prompt)


if __name__ == "__main__":
    unittest.main()