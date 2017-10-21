#!flask/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, abort, make_response, request, redirect, url_for, send_from_directory
from flask_cors import CORS, cross_origin

