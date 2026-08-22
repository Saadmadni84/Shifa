# Shifa RAG — Research Evaluation Suite

`evaluation/` turns the Shifa RAG pipeline into a **controlled retrieval and
generation research harness**. It ships a self-contained medical QA benchmark,
three retrievers, chunking, standard IR metrics, generation metrics, and four
experiments that run end-to-end offline.

> **Framing (important).** This is a *research* harness for domain-specific
> QA / retrieval experimentation over educational medical summaries. It is
> **not** a clinical validation study, and nothing here should be presented
> as clinically validated medical advice or as evidence of diagnostic
> capability.

## What this answers

| Experiment | Research question | Measures |
|---|---|---|
| 1. Retrieval methods | BM25 vs dense vs hybrid (RRF) | Recall@5, Recall@10, Precision@K, MRR, nDCG@10 |
| 2. Embedding models | Does the embedding model change retrieval quality? | Same metrics, same queries, same chunks |
| 3. Chunk size | How does chunk size affect retrieval quality in domain-specific medical QA? | 256 / 512 / 768 / 1024 tokens |
| 4. Generation stage | Are generated answers grounded in the retrieved context? | Faithfulness, hallucination rate, answer relevance, context relevance |

The pipeline studied:

```
Medical documents → Chunking → Embedding → Retrieval → LLM → Evaluation
                                                          ↑
                              (chunk size · embedding model · retrieval
                               method · top-k · fusion — varied per experiment)
```

## Benchmark dataset

- **Corpus** — 80 original, educational medical summaries (~19.5k words, 20
  topic areas: cardiology, endocrinology, respiratory, gastroenterology,
  nephrology, hepatology, haematology, neurology, psychiatry, dermatology,
  ophthalmology, infectious disease, rheumatology, pharmacology…). All text
  is original material written for this benchmark.
- **Questions** — 195 QA pairs annotated with an expected answer and the
  relevant document(s): 150 single-document and 45 multi-document questions
  (which require finding *more than one* document). Difficulty is labelled
  easy / medium / hard; hard questions paraphrase clinical vocabulary so that
  keyword matching alone is not sufficient.
- **Relevance** — document-level: a retrieved chunk counts as a hit when its
  originating document is in the question's relevant set.

## Running the experiments

```bash
cd backend/rag-service2
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt        # or just: pip install numpy tiktoken sentence-transformers

# full suite (writes evaluation/results/*.json + report.md)
python -m evaluation.run_evaluation

# targeted runs
python -m evaluation.run_evaluation --experiments 1            # retrieval methods only
python -m evaluation.run_evaluation --experiments 1,3 --max-queries 50   # smoke run
python -m evaluation.run_evaluation --skip-llm                # offline heuristics only
```

### Embedding models

The harness supports two families of embeddings:

1. **Built-in offline embedders** (default, no network needed):
   - `lsa-<dim>` — TF-IDF + truncated SVD (latent semantic analysis)
   - `ngram-hash-<dim>` — feature-hashed character n-gram embeddings
2. **Sentence-transformers models** (any name; one-time HuggingFace download):
   ```bash
   python -m evaluation.run_evaluation \
     --embedding-models sentence-transformers/all-MiniLM-L6-v2,BAAI/bge-small-en-v1.5,sentence-transformers/all-mpnet-base-v2
   ```

### Chunking

Chunk sizes are **token-count based** (tiktoken `cl100k_base` when its BPE
ranks are downloadable; a deterministic word-count estimator otherwise — the
tokenizer mode is recorded per chunk). Splitting is recursive on
paragraph / sentence / word boundaries with no overlap by default.

### Generation-stage evaluation

- Generators: `extractive` (offline baseline: answer = top retrieved chunk)
  and `gemini` (production generator; used automatically when
  `GEMINI_API_KEY` is set).
- Scorers: `HeuristicGenerationScorer` (lexical claim support + embedding
  similarity; always available) and `LLMJudge` (Gemini-as-judge; used when an
  API key is present, with per-sample heuristic fallback).

## Results (committed run, 2026-08-20)

Full tables are in [`results/report.md`](results/report.md); raw per-query
scores in the JSON files next to it. Headline findings from the committed run:

1. **Retrieval method** — on the full 195-query set all three strategies are
   near-ceiling (Recall@5 0.957–0.967), but on the **hard subset** (n=60)
   dense retrieval reaches Recall@5 0.900 vs BM25 0.878, and on the
   **multi-document subset** (n=45) dense reaches 0.856 vs BM25 0.815 —
   i.e., semantic/dense retrieval helps exactly where questions paraphrase
   or need more than one document. Hybrid (RRF) sits between and is the most
   robust choice.
2. **Embedding model matters** — with everything else fixed, `lsa-50` dense
   (Recall@5 0.967) beats `lsa-25` (0.953), and the weak `ngram-hash-512`
   embedder collapses to 0.662 — while **hybrid fusion recovers most of the
   gap (0.886)**, a clean demonstration of why sparse+dense fusion is
   valuable when the dense component is imperfect.
3. **Chunk size** — dense retrieval degrades at 256 tokens (Recall@5 0.950,
   MRR 0.909) and plateaus at 512+ tokens; BM25 is nearly insensitive to
   chunk size. For this corpus, **512 tokens is the sweet spot** for dense
   retrieval.
4. **Generation stage** — the extractive baseline is fully faithful
   (faithfulness 1.0, hallucination rate 0.0 by construction) with answer
   relevance 0.73 against the benchmark. The `gemini` generator and the
   LLM-as-judge run automatically when `GEMINI_API_KEY` is present; the
   committed run used the offline heuristic scorer.

## Tests

```bash
cd backend/rag-service2
python -m pytest evaluation/tests -q        # 31 tests, no network required
```

The test suite covers metric correctness (Recall/Precision/MRR/nDCG), BM25
ranking, RRF fusion math, token chunking invariants, generation metrics
(faithfulness/hallucination detection), and benchmark dataset integrity.

### CI hookup

The suite is CI-friendly (numpy + tiktoken + pytest only; no model
downloads). Add this job to `.github/workflows/ci.yml`:

```yaml
  eval-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install evaluation dependencies
        working-directory: backend/rag-service2
        run: |
          pip install numpy tiktoken pytest
      - name: Run evaluation harness tests
        working-directory: backend/rag-service2
        run: python -m pytest evaluation/tests -q
```

## Layout

```
evaluation/
├── corpus/medical_corpus.json      # 80 educational medical documents
├── dataset/qa_dataset.json         # 195 annotated questions
├── retrieval/                      # BM25, dense (LSA / ST models), hybrid RRF
├── chunking/                       # token-based recursive chunker
├── metrics/                        # retrieval + generation metrics
├── experiments/                    # experiments 1-4 + runner
├── report.py                       # markdown report generator
├── run_evaluation.py               # CLI entry point
├── results/                        # committed results + report.md
└── tests/                          # 31 unit tests
```

## For a resume / portfolio — what can honestly be claimed

After running the suite, statements like these are accurate:

- "Built an evaluation framework for a medical-domain RAG pipeline and
  benchmarked it on a 195-question QA set, comparing **dense, sparse (BM25),
  and hybrid (RRF) retrieval** across Recall@5, Recall@10, Precision@K, and
  MRR."
- "Investigated **chunk size and embedding-model effects** on retrieval
  quality, identifying 512-token chunks and the stronger LSA embedder as the
  best-performing configuration on this corpus."
- "Evaluated the generation stage separately, measuring **faithfulness,
  answer relevance, context relevance, and hallucination rate** with an
  offline heuristic scorer and an LLM-as-judge."

Claims that are **not** supported (and should not be made): clinical
validation, medical-grade accuracy, or any suggestion that the system can
diagnose or advise patients.
