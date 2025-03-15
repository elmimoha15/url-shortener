import random, string
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from fastapi import Request

from . import models, schemas
from .database import SessionLocal

router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Generate random short code
def generate_short_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


# POST /shorten
@router.post("/shorten", response_model=schemas.URLResponse)
def create_short_url(
    request_data: schemas.URLRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Optional: reuse existing short link if original URL exists
    existing = db.query(models.ShortURL).filter_by(original_url=request_data.url).first()
    if existing:
        short_url = str(request.url_for("redirect_to_original", short_code=existing.short_code))
        return {"short_url": short_url}

    # Generate unique short code
    short_code = generate_short_code()
    while db.query(models.ShortURL).filter_by(short_code=short_code).first():
        short_code = generate_short_code()

    new_link = models.ShortURL(original_url=request_data.url, short_code=short_code)
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    # Dynamically create full short URL
    short_url = str(request.url_for("redirect_to_original", short_code=short_code))
    return {"short_url": short_url}


# GET /{short_code} — Redirect to original URL
@router.get("/{short_code}", name="redirect_to_original")
def redirect_to_original(short_code: str, db: Session = Depends(get_db)):
    link = db.query(models.ShortURL).filter_by(short_code=short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return RedirectResponse(url=link.original_url)
