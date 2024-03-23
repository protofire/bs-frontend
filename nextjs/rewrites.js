async function rewrites() {
  return [
    { source: '/node-api/proxy/:slug*', destination: '/api/proxy' },
    { source: '/node-api/:slug*', destination: '/api/:slug*' },
    // Shards rewrites
    { source: '/:shard/address/:slug*', destination: '/address/:slug*' },
    { source: '/:shard/block/:slug*', destination: '/block/:slug*' },
    { source: '/:shard/blocks/:slug*', destination: '/blocks/:slug*' },
    { source: '/:shard/tx/:slug*', destination: '/tx/:slug*' },
    { source: '/:shard/txs/:slug*', destination: '/txs/:slug*' },
  ].filter(Boolean);
}

module.exports = rewrites;
