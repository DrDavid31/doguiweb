let pineconeClient = null;

function getPineconeIndex() {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) return null;
  if (!pineconeClient) {
    const { Pinecone } = require("@pinecone-database/pinecone");
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }

  const index = pineconeClient.index(process.env.PINECONE_INDEX_NAME);
  const namespace = process.env.PINECONE_NAMESPACE;
  return namespace ? index.namespace(namespace) : index;
}

module.exports = { getPineconeIndex };
