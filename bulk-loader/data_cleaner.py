import configparser
import csv
import getopt
import logging
import sys
import time

import requests

from utils import get_headers

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(name)-14.14s] [%(levelname)-7.7s]  %(message)s")
logger = logging.getLogger("Data Cleaner")

config = configparser.RawConfigParser()
config.read("config/dataload.ini")

OK_RESPONSE_CODES = [204]
NOT_FOUND_RESPONSE_CODES = [404]
BAD_TOKEN_RESPONSE_CODES = [400, 401, 403, 500]

RECORD_LOGGER_BATCH_SIZE = 25


def main(argv: list) -> None:
    """
    Parse command line arguments and delete records with granted ids.

    :param list argv: Command line arguments.
    """
    usage = ("usage: python data_cleaner.py\n"
             "-h or --help - get script usage information\n"
             "--purge_file_path - path to the file with ids of records to delete")

    try:
        opts, _ = getopt.getopt(argv, "h", ["purge_file_path="])
    except getopt.GetoptError as e:
        logger.error(e)
        logger.error(f"Correct usage: {usage}")
        sys.exit(2)

    purge_file_path = ""

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            logger.info(f"Correct usage: {usage}")
            sys.exit()
        elif opt == "--purge_file_path":
            purge_file_path = arg.strip()
            logger.info(f"Path to the file with ids to delete: {purge_file_path}")

    if purge_file_path:
        delete_records(purge_file_path)
    else:
        logger.error("You need to set a path to the file with ids to delete from storage. "
                     "Use --purge_file_path parameter for this matter when you run this script "
                     "next time.")


def delete_records(purge_file_path: str) -> None:
    """
    Delete records from storage.

    :param str purge_file_path: Path to the file with record ids to delete.
    """
    with open(purge_file_path, newline="") as file:
        reader = csv.reader(file)

        records_count = 0
        for row in reader:
            for _ in row:
                records_count += 1

        logger.info(f"Total number of records to delete: {records_count}.")

        file.seek(0)

        deleted_records_count = 0
        skipped_records_count = 0
        for row in reader:
            for record_id in row:
                if delete_record_by_id(record_id):
                    deleted_records_count += 1
                else:
                    skipped_records_count += 1

                processed_records_count = deleted_records_count + skipped_records_count
                if processed_records_count % RECORD_LOGGER_BATCH_SIZE == 0:
                    logger.info(f"Processed records number: "
                                f"[{processed_records_count}/{records_count}].")

    logger.info(f"Total deleted records number: {deleted_records_count}, "
                f"skipped records number: {skipped_records_count}.")


def delete_record_by_id(record_id: str) -> bool:
    """
    Delete record from storage by its id.

    :param str record_id: Record id to delete.
    :return: True, if the record was deleted, False otherwise.
    :rtype: bool
    """
    try:
        request_retries = config.getint("CONNECTION", "retries")
        storage_url = config.get("CONNECTION", "storage_url")
        connection_timeout = config.getint("CONNECTION", "timeout")
    except (configparser.NoSectionError, configparser.NoOptionError) as e:
        logger.error(f"{e}. Update config and run the script once more.")
        sys.exit(2)

    for retry in range(request_retries):
        response = requests.delete(f"{storage_url}/{record_id}", headers=get_headers(config))

        if response.status_code in OK_RESPONSE_CODES:
            return True

        if response.status_code in NOT_FOUND_RESPONSE_CODES:
            logger.error(f"{record_id} was not found.")
            return False

        if retry + 1 < request_retries:
            logger.error(f"Response status: {response.status_code}."
                         f"Response content: {response.text[:250]}.")

            if response.status_code in BAD_TOKEN_RESPONSE_CODES:
                logger.error("Invalid or expired token.")
            else:
                time_to_sleep = connection_timeout * 2 ** retry

                logger.info(f"Retrying in {time_to_sleep} seconds...")

                time.sleep(time_to_sleep)

    logger.error(f"Could not delete {record_id} from storage.")
    logger.error(f"Response status: {response.status_code}."
                 f"Response content: {response.text[:250]}.")
    return False


if __name__ == "__main__":
    main(sys.argv[1:])
