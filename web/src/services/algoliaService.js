import algoliasearch from 'algoliasearch/lite';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export const getIndex = (indexName) => searchClient.initIndex(indexName);

export const searchRequests = async (query, options = {}) => {
  const index = getIndex('questions');
  const { hits } = await index.search(query, options);
  return hits;
}; 