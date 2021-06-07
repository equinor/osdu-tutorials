from flask import Flask
from flask_restful import Api
from .well_resource import WellResource
from .drilling_resource import DrillingResource


def create_osdu_api(app: Flask):
    """Create apis for OSDU resources"""
    api = Api(app)

    api.add_resource(WellResource, "/api/well/<well_name>")
    api.add_resource(DrillingResource, "/api/drilling/<drilling_type_name>")
