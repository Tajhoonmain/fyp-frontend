from fastapi import FastAPI
from routes import localize, navigate

app = FastAPI()

app.include_router(localize.router)
app.include_router(navigate.router)
