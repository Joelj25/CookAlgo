#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime, date
import uuid

class CookAlgoAPITester:
    def __init__(self, base_url="https://cookalgo-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.sample_recipe_ids = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = {
            "test_name": name,
            "status": status,
            "success": success,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status}: {name} - {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if success:
                try:
                    response_data = response.json()
                    details += f", Response: {json.dumps(response_data, indent=2)[:200]}..."
                except:
                    details += f", Response: {response.text[:200]}..."
            else:
                details += f", Error: {response.text[:200]}..."

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_sample_data_initialization(self):
        """Test sample data initialization"""
        print("\n🔧 Testing Sample Data Initialization...")
        success, response = self.run_test(
            "Initialize Sample Data",
            "POST",
            "init-sample-data",
            200
        )
        return success

    def test_recipe_endpoints(self):
        """Test all recipe-related endpoints"""
        print("\n🍳 Testing Recipe Endpoints...")
        
        # Test get all recipes
        success, recipes = self.run_test(
            "Get All Recipes",
            "GET",
            "recipes",
            200
        )
        
        if success and recipes:
            self.sample_recipe_ids = [recipe['id'] for recipe in recipes[:3]]
            self.log_test("Sample Recipe IDs Retrieved", True, f"Found {len(self.sample_recipe_ids)} recipe IDs")
        
        # Test recipe filtering by category
        success, filtered_recipes = self.run_test(
            "Filter Recipes by Category",
            "GET",
            "recipes?category=Breakfast",
            200
        )
        
        # Test recipe filtering by difficulty
        success, filtered_recipes = self.run_test(
            "Filter Recipes by Difficulty",
            "GET",
            "recipes?difficulty=Easy",
            200
        )
        
        # Test get specific recipe
        if self.sample_recipe_ids:
            success, recipe = self.run_test(
                "Get Specific Recipe",
                "GET",
                f"recipes/{self.sample_recipe_ids[0]}",
                200
            )
        
        # Test create new recipe
        new_recipe_data = {
            "name": "Test Recipe",
            "description": "A test recipe for API testing",
            "ingredients": ["1 cup test ingredient", "2 tbsp test spice"],
            "instructions": ["Mix ingredients", "Cook for 10 minutes"],
            "prep_time": 10,
            "cook_time": 15,
            "servings": 2,
            "difficulty": "Easy",
            "category": "Breakfast",
            "nutrition": {
                "calories": 200,
                "protein": 10,
                "carbs": 30,
                "fats": 5
            },
            "image_url": "https://example.com/test-image.jpg"
        }
        
        success, new_recipe = self.run_test(
            "Create New Recipe",
            "POST",
            "recipes",
            200,
            data=new_recipe_data
        )
        
        if success and new_recipe:
            test_recipe_id = new_recipe.get('id')
            
            # Test update recipe
            updated_recipe_data = new_recipe_data.copy()
            updated_recipe_data['name'] = "Updated Test Recipe"
            
            success, updated_recipe = self.run_test(
                "Update Recipe",
                "PUT",
                f"recipes/{test_recipe_id}",
                200,
                data=updated_recipe_data
            )
            
            # Test delete recipe
            success, delete_response = self.run_test(
                "Delete Recipe",
                "DELETE",
                f"recipes/{test_recipe_id}",
                200
            )

    def test_meal_planning_endpoints(self):
        """Test meal planning endpoints"""
        print("\n📅 Testing Meal Planning Endpoints...")
        
        # Test get all meal plans
        success, meal_plans = self.run_test(
            "Get All Meal Plans",
            "GET",
            "meal-plans",
            200
        )
        
        # Test get meal plan for specific date
        test_date = date.today().isoformat()
        success, meal_plan = self.run_test(
            "Get Meal Plan by Date",
            "GET",
            f"meal-plans/{test_date}",
            200
        )
        
        # Test create meal plan
        if self.sample_recipe_ids:
            meal_plan_data = {
                "date": test_date,
                "breakfast": self.sample_recipe_ids[0] if len(self.sample_recipe_ids) > 0 else None,
                "lunch": self.sample_recipe_ids[1] if len(self.sample_recipe_ids) > 1 else None,
                "dinner": self.sample_recipe_ids[2] if len(self.sample_recipe_ids) > 2 else None,
                "snacks": []
            }
            
            success, new_meal_plan = self.run_test(
                "Create Meal Plan",
                "POST",
                "meal-plans",
                200,
                data=meal_plan_data
            )

    def test_nutrition_endpoints(self):
        """Test nutrition tracking endpoints"""
        print("\n🥗 Testing Nutrition Endpoints...")
        
        test_date = date.today().isoformat()
        
        # Test get nutrition logs for date
        success, nutrition_data = self.run_test(
            "Get Nutrition Logs by Date",
            "GET",
            f"nutrition-logs/{test_date}",
            200
        )
        
        # Test create nutrition log
        if self.sample_recipe_ids:
            nutrition_log_data = {
                "date": test_date,
                "meal_type": "breakfast",
                "recipe_id": self.sample_recipe_ids[0],
                "servings": 1.0
            }
            
            success, new_log = self.run_test(
                "Create Nutrition Log",
                "POST",
                "nutrition-logs",
                200,
                data=nutrition_log_data
            )

    def test_ai_chat_endpoints(self):
        """Test AI chat endpoints"""
        print("\n🤖 Testing AI Chat Endpoints...")
        
        session_id = f"test-session-{uuid.uuid4()}"
        
        # Test AI chat
        chat_data = {
            "session_id": session_id,
            "message": "What's a good recipe for breakfast?"
        }
        
        success, chat_response = self.run_test(
            "AI Chat Request",
            "POST",
            "ai-chat",
            200,
            data=chat_data
        )
        
        # Test get chat history
        success, chat_history = self.run_test(
            "Get Chat History",
            "GET",
            f"ai-chat/{session_id}",
            200
        )
        
        # Test AI nutrition analysis
        nutrition_analysis_data = {
            "nutrition_data": {
                "calories": 2000,
                "protein": 100,
                "carbs": 250,
                "fats": 70
            },
            "goals": {
                "calories": 2200,
                "protein": 120,
                "carbs": 275,
                "fats": 75
            }
        }
        
        success, analysis_response = self.run_test(
            "AI Nutrition Analysis",
            "POST",
            "ai-nutrition-analysis",
            200,
            data=nutrition_analysis_data
        )

    def test_error_handling(self):
        """Test error handling"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test get non-existent recipe
        success, error_response = self.run_test(
            "Get Non-existent Recipe",
            "GET",
            "recipes/non-existent-id",
            404
        )
        
        # Test create recipe with invalid data
        invalid_recipe_data = {
            "name": "",  # Empty name should cause validation error
            "description": "Test"
        }
        
        success, error_response = self.run_test(
            "Create Recipe with Invalid Data",
            "POST",
            "recipes",
            422  # Validation error
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CookAlgo API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test sample data initialization first
        self.test_sample_data_initialization()
        
        # Test all endpoints
        self.test_recipe_endpoints()
        self.test_meal_planning_endpoints()
        self.test_nutrition_endpoints()
        self.test_ai_chat_endpoints()
        self.test_error_handling()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CookAlgoAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'tests_run': tester.tests_run,
                'tests_passed': tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())