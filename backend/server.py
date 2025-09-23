from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, date, time
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Pydantic Models
class Recipe(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: int  # minutes
    cook_time: int  # minutes
    servings: int
    difficulty: str  # Easy, Medium, Hard
    category: str
    nutrition: Dict[str, float]  # calories, protein, carbs, fats
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecipeCreate(BaseModel):
    name: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: int
    cook_time: int
    servings: int
    difficulty: str
    category: str
    nutrition: Dict[str, float]
    image_url: Optional[str] = None

class MealPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # ISO date string
    breakfast: Optional[str] = None
    lunch: Optional[str] = None
    dinner: Optional[str] = None
    snacks: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MealPlanCreate(BaseModel):
    date: str
    breakfast: Optional[str] = None
    lunch: Optional[str] = None
    dinner: Optional[str] = None
    snacks: List[str] = Field(default_factory=list)

class NutritionLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    meal_type: str  # breakfast, lunch, dinner, snack
    recipe_id: str
    servings: float
    calories: float
    protein: float
    carbs: float
    fats: float
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NutritionLogCreate(BaseModel):
    date: str
    meal_type: str
    recipe_id: str
    servings: float

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    session_id: str
    message: str

# Helper functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, (date, time)):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse ISO strings back to datetime objects from MongoDB"""
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('logged_at'), str):
        item['logged_at'] = datetime.fromisoformat(item['logged_at'])
    if isinstance(item.get('timestamp'), str):
        item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    return item

# Recipe Routes
@api_router.post("/recipes", response_model=Recipe)
async def create_recipe(recipe_data: RecipeCreate):
    recipe = Recipe(**recipe_data.dict())
    recipe_dict = prepare_for_mongo(recipe.dict())
    await db.recipes.insert_one(recipe_dict)
    return recipe

@api_router.get("/recipes", response_model=List[Recipe])
async def get_recipes(category: Optional[str] = None, difficulty: Optional[str] = None):
    filter_query = {}
    if category:
        filter_query["category"] = category
    if difficulty:
        filter_query["difficulty"] = difficulty
    
    recipes = await db.recipes.find(filter_query).to_list(100)
    return [Recipe(**parse_from_mongo(recipe)) for recipe in recipes]

@api_router.get("/recipes/{recipe_id}", response_model=Recipe)
async def get_recipe(recipe_id: str):
    recipe = await db.recipes.find_one({"id": recipe_id})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return Recipe(**parse_from_mongo(recipe))

@api_router.put("/recipes/{recipe_id}", response_model=Recipe)
async def update_recipe(recipe_id: str, recipe_data: RecipeCreate):
    recipe = Recipe(**recipe_data.dict())
    recipe.id = recipe_id
    recipe_dict = prepare_for_mongo(recipe.dict())
    await db.recipes.replace_one({"id": recipe_id}, recipe_dict)
    return recipe

@api_router.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    result = await db.recipes.delete_one({"id": recipe_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted successfully"}

# Meal Planning Routes
@api_router.post("/meal-plans", response_model=MealPlan)
async def create_meal_plan(meal_plan_data: MealPlanCreate):
    meal_plan = MealPlan(**meal_plan_data.dict())
    meal_plan_dict = prepare_for_mongo(meal_plan.dict())
    await db.meal_plans.insert_one(meal_plan_dict)
    return meal_plan

@api_router.get("/meal-plans", response_model=List[MealPlan])
async def get_meal_plans():
    meal_plans = await db.meal_plans.find().sort("date", 1).to_list(50)
    return [MealPlan(**parse_from_mongo(plan)) for plan in meal_plans]

@api_router.get("/meal-plans/{date}", response_model=MealPlan)
async def get_meal_plan_by_date(date: str):
    meal_plan = await db.meal_plans.find_one({"date": date})
    if not meal_plan:
        # Return empty meal plan for the date
        return MealPlan(date=date)
    return MealPlan(**parse_from_mongo(meal_plan))

# Nutrition Tracking Routes
@api_router.post("/nutrition-logs", response_model=NutritionLog)
async def create_nutrition_log(log_data: NutritionLogCreate):
    # Get recipe to calculate nutrition
    recipe = await db.recipes.find_one({"id": log_data.recipe_id})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Calculate nutrition based on servings
    nutrition = recipe["nutrition"]
    log = NutritionLog(
        date=log_data.date,
        meal_type=log_data.meal_type,
        recipe_id=log_data.recipe_id,
        servings=log_data.servings,
        calories=nutrition["calories"] * log_data.servings,
        protein=nutrition["protein"] * log_data.servings,
        carbs=nutrition["carbs"] * log_data.servings,
        fats=nutrition["fats"] * log_data.servings
    )
    
    log_dict = prepare_for_mongo(log.dict())
    await db.nutrition_logs.insert_one(log_dict)
    return log

@api_router.get("/nutrition-logs/{date}")
async def get_nutrition_logs_by_date(date: str):
    logs = await db.nutrition_logs.find({"date": date}).to_list(50)
    parsed_logs = [parse_from_mongo(log) for log in logs]
    
    # Calculate daily totals
    total_calories = sum(log["calories"] for log in parsed_logs)
    total_protein = sum(log["protein"] for log in parsed_logs)
    total_carbs = sum(log["carbs"] for log in parsed_logs)
    total_fats = sum(log["fats"] for log in parsed_logs)
    
    return {
        "date": date,
        "logs": parsed_logs,
        "totals": {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2),
            "carbs": round(total_carbs, 2),
            "fats": round(total_fats, 2)
        }
    }

# AI Cooking Assistant Routes
@api_router.post("/ai-chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Create LLM chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=request.session_id,
            system_message="You are a helpful cooking assistant and nutritionist. Help users with recipes, cooking techniques, nutrition advice, meal planning, and dietary questions. Always provide practical, actionable advice."
        ).with_model("openai", "gpt-4o-mini")
        
        # Send message to AI
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save chat history
        chat_record = ChatMessage(
            session_id=request.session_id,
            message=request.message,
            response=response
        )
        chat_dict = prepare_for_mongo(chat_record.dict())
        await db.chat_history.insert_one(chat_dict)
        
        return {"response": response}
        
    except Exception as e:
        logging.error(f"AI chat error: {e}")
        return {"response": "I'm having trouble responding right now. Please try again later."}

@api_router.get("/ai-chat/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_history.find({"session_id": session_id}).sort("timestamp", 1).to_list(50)
    return [parse_from_mongo(msg) for msg in messages]

# AI Nutrition Analysis
@api_router.post("/ai-nutrition-analysis")
async def analyze_nutrition(data: Dict[str, Any]):
    try:
        # Create specialized nutrition analysis prompt
        nutrition_data = data.get("nutrition_data", {})
        goals = data.get("goals", {})
        
        prompt = f"""
        Analyze the following nutrition data and provide insights and recommendations:
        
        Daily Totals: {nutrition_data}
        User Goals: {goals}
        
        Please provide:
        1. Assessment of current nutrition compared to goals
        2. Specific recommendations for improvement
        3. Suggested meal adjustments
        4. Health insights
        
        Keep the response practical and actionable.
        """
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"nutrition-analysis-{uuid.uuid4()}",
            system_message="You are a professional nutritionist AI. Provide detailed nutrition analysis and actionable recommendations based on user data."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"analysis": response}
        
    except Exception as e:
        logging.error(f"Nutrition analysis error: {e}")
        return {"analysis": "Unable to analyze nutrition data at the moment. Please try again later."}

# Sample data initialization
@api_router.post("/init-sample-data")
async def initialize_sample_data():
    # Check if we already have sample recipes
    existing_count = await db.recipes.count_documents({})
    if existing_count > 0:
        return {"message": "Sample data already exists"}
    
    sample_recipes = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic Pancakes",
            "description": "Fluffy, delicious pancakes perfect for breakfast",
            "ingredients": [
                "2 cups all-purpose flour",
                "2 tbsp sugar",
                "2 tsp baking powder",
                "1 tsp salt",
                "2 eggs",
                "1.5 cups milk",
                "4 tbsp melted butter"
            ],
            "instructions": [
                "Mix dry ingredients in a bowl",
                "Whisk eggs, milk, and melted butter in another bowl",
                "Combine wet and dry ingredients until just mixed",
                "Heat pan and cook pancakes until bubbles form",
                "Flip and cook until golden brown"
            ],
            "prep_time": 10,
            "cook_time": 15,
            "servings": 4,
            "difficulty": "Easy",
            "category": "Breakfast",
            "nutrition": {
                "calories": 320,
                "protein": 12,
                "carbs": 45,
                "fats": 10
            },
            "image_url": "https://images.unsplash.com/photo-1630441508966-431c08536d1b",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Quinoa Power Bowl",
            "description": "Nutritious bowl packed with protein and vegetables",
            "ingredients": [
                "1 cup quinoa",
                "2 cups vegetable broth",
                "1 avocado, sliced",
                "1 cup cherry tomatoes",
                "1/2 cup chickpeas",
                "2 tbsp olive oil",
                "1 tbsp lemon juice",
                "Salt and pepper to taste"
            ],
            "instructions": [
                "Cook quinoa in vegetable broth according to package directions",
                "Let quinoa cool slightly",
                "Arrange quinoa in bowl with toppings",
                "Drizzle with olive oil and lemon juice",
                "Season with salt and pepper"
            ],
            "prep_time": 15,
            "cook_time": 20,
            "servings": 2,
            "difficulty": "Easy",
            "category": "Lunch",
            "nutrition": {
                "calories": 450,
                "protein": 15,
                "carbs": 55,
                "fats": 18
            },
            "image_url": "https://images.unsplash.com/photo-1562923690-e274ba919781",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Herb-Crusted Chicken",
            "description": "Juicy chicken breast with aromatic herb crust",
            "ingredients": [
                "4 chicken breasts",
                "2 tbsp olive oil",
                "1 tbsp dried herbs",
                "2 cloves garlic, minced",
                "1 tsp paprika",
                "Salt and pepper",
                "1 lemon, juiced"
            ],
            "instructions": [
                "Preheat oven to 375°F",
                "Mix herbs, garlic, paprika, salt and pepper",
                "Brush chicken with olive oil and lemon juice",
                "Coat chicken with herb mixture",
                "Bake for 25-30 minutes until cooked through"
            ],
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4,
            "difficulty": "Medium",
            "category": "Dinner",
            "nutrition": {
                "calories": 280,
                "protein": 35,
                "carbs": 5,
                "fats": 12
            },
            "image_url": "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.recipes.insert_many(sample_recipes)
    return {"message": "Sample data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()