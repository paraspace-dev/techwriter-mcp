# Why responses cache by prefix

The model provider caches the longest prefix of a prompt it has seen before,
so anything that changes per request poisons the cache for everything after
it. A timestamp in the first line costs you the whole corpus.

techwriter-mcp builds every prompt in the same order for this reason. The editorial
brief, your instructions, and the voice corpus never change between requests,
so they form the prefix; the task, the facts, and the document under edit
come after. The first request of a session pays full price and writes the
cache. Every request after that reads most of its input from cache, which is
why a 90KB corpus is affordable to send on every call.

If you change the corpus, the prefix changes and the next request pays full
price once. That is the entire cost model.
