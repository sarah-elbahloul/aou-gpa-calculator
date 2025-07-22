import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# ------------------------------------------------------------------------- Functions ------------------------------------------------------------------------------------#
def initialize_firebase():
    """Initializes Firebase Admin SDK with the given service account key from an environment variable."""
    service_account_path = 'D:\\Service Accounts Keys\\aou-gpa-calculator-firebase-adminsdk-.json'

    if not service_account_path:
        logging.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable is not set.")
        return None

    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            logging.error(f"❌ Failed to initialize Firebase: {e}")
            return None

    return firestore.client()

def upload_json_to_firestore(json_file_path, collection_name):
    """Uploads a JSON file to a specified Firestore collection."""
    db = initialize_firebase()
    if not db:
        return
    try:
        with open(json_file_path, "r", encoding="utf-8") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        logging.error(f"❌ JSON file not found: {json_file_path}")
        return
    except json.JSONDecodeError:
        logging.error(f"❌ Error decoding JSON file: {json_file_path}")
        return

    try:
        for doc_id, doc_data in data.items():
            db.collection(collection_name).document(doc_id).set(doc_data)

        logging.info(f"✅ Data from {json_file_path} uploaded successfully to '{collection_name}'!")
    except Exception as e:
        logging.error(f"❌ Failed to upload data to Firestore: {e}")

def upload_json_array_to_firestore(json_file_path, collection_name):
    """
    Uploads a JSON file to a specified Firestore collection.
    Supports:
    - List of dicts with a 'code' key: generates doc IDs like '1-FCS', '2-FBA', etc.
    - Dict of {id: data} format: uses keys as document IDs.
    """
    db = initialize_firebase()
    if not db:
        return
    try:
        with open(json_file_path, "r", encoding="utf-8") as json_file:
            data = json.load(json_file)
    except FileNotFoundError:
        logging.error(f"❌ JSON file not found: {json_file_path}")
        return
    except json.JSONDecodeError:
        logging.error(f"❌ Error decoding JSON file: {json_file_path}")
        return

    try:
        if isinstance(data, list):
            for i, item in enumerate(data, start=1):
                if not isinstance(item, dict) or "code" not in item:
                    logging.warning("⚠️ Skipped invalid item without 'code': %s", item)
                    continue
                doc_id = f"{i}-{item['code']}"
                db.collection(collection_name).document(doc_id).set(item)
        elif isinstance(data, dict):
            for doc_id, doc_data in data.items():
                db.collection(collection_name).document(doc_id).set(doc_data)
        else:
            logging.error("❌ JSON structure not supported. Must be a list of dicts or a dict.")
            return

        logging.info(f"✅ Data from {json_file_path} uploaded successfully to '{collection_name}'!")
    except Exception as e:
        logging.error(f"❌ Failed to upload data to Firestore: {e}")


# Initialize Firebase (Make sure you've set your service account path in an environment variable)
def initialize_firestore():
    """Initializes Firestore client."""
    if not firebase_admin._apps:
        cred = credentials.Certificate('D:\\Service Accounts Keys\\aou-gpa-calculator-firebase-adminsdk-.json')  # Update this
        firebase_admin.initialize_app(cred)
    return firestore.client()

def remove_entries_from_firestore(collection_name, field_name, value_to_remove):
    """
    Removes documents from a Firestore collection where a specific field matches a given value.
    :param collection_name: Name of the Firestore collection.
    :param field_name: The field to check in each document.
    :param value_to_remove: The value that should trigger deletion.
    """
    db = initialize_firestore()
    collection_ref = db.collection(collection_name)

    # Wrap field_name in backticks if it contains spaces
    safe_field_name = f"`{field_name}`" if " " in field_name else field_name

    # Query Firestore for documents where the field equals the value_to_remove
    query = collection_ref.where(safe_field_name, "==", value_to_remove).stream()

    deleted_count = 0
    for doc in query:
        doc.reference.delete()
        logging.info(f"✅ Deleted document {doc.id} where {field_name} == {value_to_remove}")
        deleted_count += 1

    if deleted_count == 0:
        logging.info(f"⚠️ No documents found where {field_name} == {value_to_remove}")


def remove_entries_containing_value(collection_name, field_name, substring):
    """
    Removes documents from Firestore where a specific field contains a substring.
    :param collection_name: Name of the Firestore collection.
    :param field_name: The field to check in each document.
    :param substring: The substring to search for.
    """
    db = initialize_firestore()
    collection_ref = db.collection(collection_name)

    # Fetch all documents (Firestore doesn't support direct substring search)
    docs = collection_ref.stream()

    deleted_count = 0
    for doc in docs:
        doc_data = doc.to_dict()
        if field_name in doc_data and substring.lower() in doc_data[field_name].lower():
            doc.reference.delete()
            logging.info(f"✅ Deleted document {doc.id} where {field_name} contains '{substring}'")
            deleted_count += 1

    if deleted_count == 0:
        logging.info(f"⚠️ No documents found where {field_name} contains '{substring}'")

def clean_firestore_keywords(collection_name, keywords_to_remove):

    db = initialize_firestore()
    # Fetch all documents in the collection
    docs = db.collection(collection_name).stream()

    def clean_keywords(keywords):
        """Remove unwanted keywords from a list."""
        return [kw for kw in keywords if kw.lower() not in keywords_to_remove and not re.search(r"\(|\)", kw)]

    # Process each document
    for doc in docs:
        data = doc.to_dict()

        if "searchKeywords" in data and isinstance(data["searchKeywords"], list):
            cleaned_keywords = clean_keywords(data["searchKeywords"])

            # Update Firestore document only if changes were made
            if cleaned_keywords != data["searchKeywords"]:
                db.collection(collection_name).document(doc.id).update({"searchKeywords": cleaned_keywords})
                print(f"Updated document: {doc.id}")

    print("Finished cleaning searchKeywords in Firestore.")


# ------------------------------------------------------------------------- End Functions ------------------------------------------------------------------------------------#
#upload_json_to_firestore('D:\\VisualStudioCodeProjects\\aou-gpa-calculator\\python_helpers\\programs.json', 'programs')
upload_json_array_to_firestore('D:\\VisualStudioCodeProjects\\aou-gpa-calculator\\python_helpers\\courses.json', 'courses')