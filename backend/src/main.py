import logging

import resend
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field
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
        "RESEND_API_KEY is not set. Resend operations will be logged instead."
    )


app = FastAPI()


class ContactForm(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=254)
    message: str = Field(min_length=1, max_length=10000)


class NewsletterForm(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=254)


@app.post("/api/contact-submit", status_code=204, operation_id="submitContactForm")
async def submit_contact_form(form: ContactForm):
    if not settings.resend_api_key:
        logger.info(f"[MOCK RESEND] Contact form submitted: {form}")
        return

    resend.api_key = settings.resend_api_key

    # retreive contacts from
    try:
        segment_contacts = resend.Contacts.list("80b4d0a3-01f3-4ab6-ba24-2ba478ec2ea0")
        recipient_emails = [c["email"] for c in segment_contacts["data"]]
    except Exception:
        logger.exception("Failed to fetch Contact Handler segment members.")
        logger.error(form)
        raise HTTPException(
            status_code=502,
            detail="We ran into an internal server error. Please try again in a few minutes.",
        )

    if not recipient_emails:
        logger.error("Contact Handler segment has no members; notification not sent.")
        logger.error(form)
        return

    try:
        params: resend.Emails.SendParams = {
            "from": "Edinburgh VenturePoint <noreply@mail.edinburghventurepoint.com>",
            "to": "contact@mail.edinburghventurepoint.com",
            "cc": recipient_emails,
            "subject": f"New contact form from {form.first_name} {form.last_name}",
            "template": {
                "id": "contact-form-notification",
                "variables": {
                    "SUBMITTER_FIRST_NAME": form.first_name,
                    "SUBMITTER_LAST_NAME": form.last_name,
                    "SUBMITTER_EMAIL": form.email,
                    "SUBMITTER_MESSAGE": form.message,
                },
            },
        }

        result = resend.Emails.send(params)

        if getattr(result, "error", None) or (
            isinstance(result, dict) and result.get("error")
        ):
            raise RuntimeError(f"Resend returned an error: {result}")

    except Exception:
        logger.exception("Failed to send contact form notification email.")
        logger.error(form)
        raise HTTPException(
            status_code=502,
            detail="We ran into an internal server error. Please try again in a few minutes.",
        )


@app.post(
    "/api/newsletter-subscribe", status_code=204, operation_id="subscribeToNewsletter"
)
async def subscribe_to_newsletter(form: NewsletterForm):
    if not settings.resend_api_key:
        logger.info(f"[MOCK RESEND] New subscriber: {form}")
        return

    try:
        params: resend.Contacts.CreateParams = {
            "email": form.email,
            "first_name": form.first_name,
            "last_name": form.last_name,
            "unsubscribed": False,
        }
        resend.Contacts.create(params)
    except Exception:
        logger.exception("Failed to subscribe to newsletter.")
        logger.error(form)
        raise HTTPException(
            status_code=502,
            detail="We ran into an internal server error. Please try again in a few minutes.",
        )
