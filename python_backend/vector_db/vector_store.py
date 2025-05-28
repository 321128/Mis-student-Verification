import os
import sys
import logging
from typing import List, Dict, Any, Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document as LangchainDocument

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStore:
    """Vector store for document embeddings using ChromaDB"""
    
    def __init__(self, collection_name: str = "documents"):
        """Initialize the vector store
        
        Args:
            collection_name: Name of the collection in ChromaDB
        """
        self.collection_name = collection_name
        self.persist_directory = os.path.join(config.VECTOR_DB_PATH, collection_name)
        
        # Create directory if it doesn't exist
        if not os.path.exists(self.persist_directory):
            os.makedirs(self.persist_directory)
        
        # Initialize embeddings model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="nomic-ai/nomic-embed-text-v1",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        
        # Initialize ChromaDB
        self.db = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name=self.collection_name
        )
        
        logger.info(f"Vector store initialized with collection '{collection_name}'")
    
    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]] = None) -> List[str]:
        """Add documents to the vector store
        
        Args:
            texts: List of text chunks to add
            metadatas: List of metadata dictionaries for each text chunk
            
        Returns:
            List of document IDs
        """
        if not texts:
            logger.warning("No texts provided to add to vector store")
            return []
        
        if metadatas is None:
            metadatas = [{} for _ in texts]
        
        # Convert to Langchain documents
        documents = [
            LangchainDocument(page_content=text, metadata=metadata)
            for text, metadata in zip(texts, metadatas)
        ]
        
        # Add documents to ChromaDB
        try:
            ids = self.db.add_documents(documents)
            self.db.persist()
            logger.info(f"Added {len(ids)} documents to vector store")
            return ids
        except Exception as e:
            logger.error(f"Error adding documents to vector store: {e}")
            return []
    
    def search(self, query: str, k: int = 5, filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for similar documents
        
        Args:
            query: Query text
            k: Number of results to return
            filter: Filter to apply to the search
            
        Returns:
            List of dictionaries with document text and metadata
        """
        try:
            results = self.db.similarity_search_with_relevance_scores(
                query, k=k, filter=filter
            )
            
            # Format results
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "text": doc.page_content,
                    "metadata": doc.metadata,
                    "score": score
                })
            
            logger.info(f"Found {len(formatted_results)} results for query: {query[:50]}...")
            return formatted_results
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            return []
    
    def delete_collection(self):
        """Delete the collection"""
        try:
            self.db.delete_collection()
            logger.info(f"Deleted collection '{self.collection_name}'")
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
    
    def get_collection_stats(self):
        """Get statistics about the collection"""
        try:
            count = self.db._collection.count()
            return {
                "collection_name": self.collection_name,
                "document_count": count
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {
                "collection_name": self.collection_name,
                "document_count": 0,
                "error": str(e)
            }