from fastapi import APIRouter, HTTPException, Depends
from models.user import AdminUserCreate, UserCreate, UserLogin, UserOut, UserRole
from utils.auth import hash_password, verify_password, create_access_token
from config import db
from bson import ObjectId
from utils.auth import require_role
from fastapi import Body

router = APIRouter()

users_col = db["users"]

@router.post("/register", response_model=UserOut)
def register(user: UserCreate):
    return create_user(user, "analyst")

@router.post("/users", response_model=UserOut, dependencies=[Depends(require_role(["admin"]))])
def admin_create_user(user: AdminUserCreate):
    return create_user(user, user.role)

def create_user(user: UserCreate, role: UserRole):
    if users_col.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_pwd = hash_password(user.password)
    user_dict = {"email": user.email, "password": hashed_pwd, "role": role}
    res = users_col.insert_one(user_dict)
    return UserOut(id=str(res.inserted_id), email=user.email, role=user_dict["role"])

@router.post("/login")
def login(user: UserLogin):
    db_user = users_col.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email, "role": db_user["role"]})
    return {"access_token": token, "token_type": "bearer"}
@router.get("/admin-only")
def admin_area(user = Depends(require_role(["admin"]))):
    return {"msg": "Welcome, admin!"}
@router.patch("/users/{id}/role")
def update_user_role(id: str, role: UserRole = Body(..., embed=True), user=Depends(require_role(["admin"]))):
    res = users_col.update_one({"_id": ObjectId(id)}, {"$set": {"role": role}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}

# DELETE endpoint for removing user
@router.delete("/users/{id}")
def delete_user(id: str, user=Depends(require_role(["admin"]))):
    res = users_col.delete_one({"_id": ObjectId(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}
@router.get("/auditor-or-admin")
def auditor_stuff(user = Depends(require_role(["admin", "auditor"]))):
    return {"msg": "You have access"}

@router.get("/users", response_model=list[UserOut])
def get_users(user=Depends(require_role(["admin"]))):
    users = list(users_col.find({}, {"password": 0}))  # Don't return password
    return [UserOut(id=str(u["_id"]), email=u["email"], role=u["role"]) for u in users]
