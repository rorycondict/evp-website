import logging

import resend
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)


class Settings(BaseSettings):
    resend_api_key: str | None = None
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

if settings.resend_api_key:
    resend.api_key = settings.resend_api_key
else:
    logger.warning(
        "RESEND_API_KEY is not set. Resend operations will be logged to stdout."
    )


app = FastAPI()


class ContactForm(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    message: str


class NewsletterForm(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str


@app.post("/api/contact-submit")
async def submit_contact_form(form: ContactForm):
    return form


@app.post("/api/newsletter-subscribe")
async def subscribe_to_newsletter(form: NewsletterForm):
    params: resend.Contacts.CreateParams = {
        "email": form.email,
        "first_name": form.first_name,
        "last_name": form.last_name,
        "unsubscribed": False,
    }

    if settings.resend_api_key:
        resend.Contacts.create(params)
    else:
        logger.info(f"[MOCK RESEND] New subscriber: {params}")

    return form
