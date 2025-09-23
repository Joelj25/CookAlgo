import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Calendar } from "./components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Plus, ChefHat, Calendar as CalendarIcon, BarChart3, MessageCircle, Clock, Users, Utensils, Target, TrendingUp } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = ({ currentView, setCurrentView }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                CookAlgo
              </span>
            </div>
            <div className="hidden md:flex space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'recipes', label: 'Recipes', icon: Utensils },
                { id: 'meal-planning', label: 'Meal Planning', icon: CalendarIcon },
                { id: 'nutrition', label: 'Nutrition', icon: Target },
                { id: 'ai-assistant', label: 'AI Assistant', icon: MessageCircle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    console.log('Clicking navigation:', id); // Debug log
                    setCurrentView(id);
                  }}
                  data-testid={`nav-${id}-btn`}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    currentView === id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = ({ recipes, nutritionData }) => {
  const totalRecipes = recipes.length;
  const avgCookTime = recipes.length > 0 ? Math.round(recipes.reduce((acc, recipe) => acc + recipe.cook_time, 0) / recipes.length) : 0;
  const todayCalories = nutritionData?.totals?.calories || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back to CookAlgo!</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <Utensils className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-recipes-count">{totalRecipes}</div>
            <p className="text-xs text-gray-600">recipes in collection</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cook Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="avg-cook-time">{avgCookTime} min</div>
            <p className="text-xs text-gray-600">average cooking time</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="today-calories">{Math.round(todayCalories)}</div>
            <p className="text-xs text-gray-600">calories consumed</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="health-score">8.5</div>
            <p className="text-xs text-gray-600">nutrition score</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1542010589005-d1eacc3918f2"
            alt="Cooking background"
            className="w-full h-80 object-cover"
          />
        </div>
        <div className="relative px-8 py-16 text-white">
          <h2 className="text-4xl font-bold mb-4">Cook Smarter, Eat Better</h2>
          <p className="text-xl mb-6 max-w-2xl">
            Discover recipes, track nutrition, and plan meals with AI-powered cooking assistance. 
            Your culinary journey starts here.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold" data-testid="get-started-btn">
            Get Started Cooking
            <ChefHat className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-orange-500" />
              Browse Recipes
            </CardTitle>
            <CardDescription>
              Explore our collection of delicious recipes
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Plan Meals
            </CardTitle>
            <CardDescription>
              Organize your weekly meal schedule
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
              Ask AI Chef
            </CardTitle>
            <CardDescription>
              Get cooking advice from our AI assistant
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

// Recipe Management Component
const RecipeManagement = ({ recipes, setRecipes }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: 'Easy',
    category: 'Breakfast',
    nutrition: { calories: '', protein: '', carbs: '', fats: '' },
    image_url: ''
  });

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredRecipes = recipes.filter(recipe => {
    const categoryMatch = selectedCategory === 'All' || recipe.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    
    try {
      const recipeData = {
        ...newRecipe,
        ingredients: newRecipe.ingredients.split('\n').filter(ing => ing.trim()),
        instructions: newRecipe.instructions.split('\n').filter(inst => inst.trim()),
        prep_time: parseInt(newRecipe.prep_time),
        cook_time: parseInt(newRecipe.cook_time),
        servings: parseInt(newRecipe.servings),
        nutrition: {
          calories: parseFloat(newRecipe.nutrition.calories) || 0,
          protein: parseFloat(newRecipe.nutrition.protein) || 0,
          carbs: parseFloat(newRecipe.nutrition.carbs) || 0,
          fats: parseFloat(newRecipe.nutrition.fats) || 0
        }
      };
      
      const response = await axios.post(`${API}/recipes`, recipeData);
      setRecipes([...recipes, response.data]);
      setIsAddDialogOpen(false);
      setNewRecipe({
        name: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: '',
        cook_time: '',
        servings: '',
        difficulty: 'Easy',
        category: 'Breakfast',
        nutrition: { calories: '', protein: '', carbs: '', fats: '' },
        image_url: ''
      });
      toast.success("Recipe added successfully!");
    } catch (error) {
      toast.error("Failed to add recipe. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" data-testid="add-recipe-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
              <DialogDescription>
                Create a new recipe with detailed instructions and nutrition information.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddRecipe} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recipe Name</label>
                  <Input
                    required
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                    data-testid="recipe-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    value={newRecipe.image_url}
                    onChange={(e) => setNewRecipe({...newRecipe, image_url: e.target.value})}
                    data-testid="recipe-image-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  required
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                  data-testid="recipe-description-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe({...newRecipe, category: value})}>
                    <SelectTrigger data-testid="recipe-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select value={newRecipe.difficulty} onValueChange={(value) => setNewRecipe({...newRecipe, difficulty: value})}>
                    <SelectTrigger data-testid="recipe-difficulty-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.slice(1).map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
                  <Input
                    type="number"
                    required
                    value={newRecipe.prep_time}
                    onChange={(e) => setNewRecipe({...newRecipe, prep_time: e.target.value})}
                    data-testid="recipe-prep-time-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
                  <Input
                    type="number"
                    required
                    value={newRecipe.cook_time}
                    onChange={(e) => setNewRecipe({...newRecipe, cook_time: e.target.value})}
                    data-testid="recipe-cook-time-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Servings</label>
                  <Input
                    type="number"
                    required
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe({...newRecipe, servings: e.target.value})}
                    data-testid="recipe-servings-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Ingredients (one per line)</label>
                <Textarea
                  required
                  rows={6}
                  value={newRecipe.ingredients}
                  onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                  placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs"
                  data-testid="recipe-ingredients-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Instructions (one per line)</label>
                <Textarea
                  required
                  rows={6}
                  value={newRecipe.instructions}
                  onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                  placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
                  data-testid="recipe-instructions-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nutrition per serving</label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Calories</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecipe.nutrition.calories}
                      onChange={(e) => setNewRecipe({...newRecipe, nutrition: {...newRecipe.nutrition, calories: e.target.value}})}
                      data-testid="recipe-calories-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Protein (g)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecipe.nutrition.protein}
                      onChange={(e) => setNewRecipe({...newRecipe, nutrition: {...newRecipe.nutrition, protein: e.target.value}})}
                      data-testid="recipe-protein-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Carbs (g)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecipe.nutrition.carbs}
                      onChange={(e) => setNewRecipe({...newRecipe, nutrition: {...newRecipe.nutrition, carbs: e.target.value}})}
                      data-testid="recipe-carbs-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Fats (g)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecipe.nutrition.fats}
                      onChange={(e) => setNewRecipe({...newRecipe, nutrition: {...newRecipe.nutrition, fats: e.target.value}})}
                      data-testid="recipe-fats-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" data-testid="save-recipe-btn">
                  Save Recipe
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Category:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32" data-testid="filter-category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Difficulty:</span>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-32" data-testid="filter-difficulty-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(diff => (
                <SelectItem key={diff} value={diff}>{diff}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <img 
                src={recipe.image_url || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"}
                alt={recipe.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" data-testid={`recipe-title-${recipe.id}`}>{recipe.name}</CardTitle>
                <Badge variant="secondary" data-testid={`recipe-difficulty-${recipe.id}`}>{recipe.difficulty}</Badge>
              </div>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.prep_time + recipe.cook_time} min</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{recipe.servings} servings</span>
                </div>
                <Badge variant="outline">{recipe.category}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{Math.round(recipe.nutrition.calories)}</div>
                  <div className="text-gray-600">Calories</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold">{Math.round(recipe.nutrition.protein)}g</div>
                  <div className="text-gray-600">Protein</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or add some new recipes.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
            Add Your First Recipe
          </Button>
        </div>
      )}
    </div>
  );
};

// Meal Planning Component  
const MealPlanning = ({ recipes }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadMealPlan = async (date) => {
    try {
      const dateStr = formatDate(date);
      const response = await axios.get(`${API}/meal-plans/${dateStr}`);
      setMealPlan(response.data);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
      setMealPlan({});
    }
  };

  useEffect(() => {
    loadMealPlan(selectedDate);
  }, [selectedDate]);

  const handleAddMeal = async () => {
    if (!selectedRecipeId) return;
    
    try {
      const dateStr = formatDate(selectedDate);
      const updatedMealPlan = { ...mealPlan };
      
      if (selectedMealType === 'snacks') {
        updatedMealPlan.snacks = [...(updatedMealPlan.snacks || []), selectedRecipeId];
      } else {
        updatedMealPlan[selectedMealType] = selectedRecipeId;
      }
      
      updatedMealPlan.date = dateStr;
      
      await axios.post(`${API}/meal-plans`, updatedMealPlan);
      setMealPlan(updatedMealPlan);
      setIsAddMealDialogOpen(false);
      setSelectedRecipeId('');
      toast.success("Meal added to plan!");
    } catch (error) {
      toast.error("Failed to add meal to plan.");
    }
  };

  const getRecipeById = (id) => {
    return recipes.find(recipe => recipe.id === id);
  };

  const MealCard = ({ mealType, recipeId }) => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return (
      <Card className="h-48 border-dashed border-2 border-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Plus className="h-8 w-8 mx-auto mb-2" />
          <p>No {mealType} planned</p>
        </div>
      </Card>
    );

    return (
      <Card className="h-48 overflow-hidden">
        <div className="aspect-video h-24 overflow-hidden">
          <img 
            src={recipe.image_url || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">{recipe.name}</CardTitle>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{recipe.prep_time + recipe.cook_time} min</span>
            <span>{Math.round(recipe.nutrition.calories)} cal</span>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meal Planning</h1>
        <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600" data-testid="add-meal-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meal to Plan</DialogTitle>
              <DialogDescription>
                Select a recipe and meal type for {formatDate(selectedDate)}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger data-testid="meal-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Recipe</label>
                <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                  <SelectTrigger data-testid="meal-recipe-select">
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddMealDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMeal} className="bg-blue-500 hover:bg-blue-600" data-testid="save-meal-btn">
                  Add Meal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                data-testid="meal-plan-calendar"
              />
            </CardContent>
          </Card>
        </div>

        {/* Meal Plan */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan for {selectedDate.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-orange-600">Breakfast</h3>
                  <MealCard mealType="breakfast" recipeId={mealPlan.breakfast} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-blue-600">Lunch</h3>
                  <MealCard mealType="lunch" recipeId={mealPlan.lunch} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-purple-600">Dinner</h3>
                  <MealCard mealType="dinner" recipeId={mealPlan.dinner} />
                </div>
              </div>
              
              {mealPlan.snacks && mealPlan.snacks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">Snacks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mealPlan.snacks.map((snackId, index) => (
                      <MealCard key={index} mealType="snack" recipeId={snackId} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Nutrition Tracking Component
const NutritionTracking = ({ recipes }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionData, setNutritionData] = useState(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [logData, setLogData] = useState({
    meal_type: 'breakfast',
    recipe_id: '',
    servings: 1
  });

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadNutritionData = async (date) => {
    try {
      const dateStr = formatDate(date);
      const response = await axios.get(`${API}/nutrition-logs/${dateStr}`);
      setNutritionData(response.data);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      setNutritionData({ date: formatDate(date), logs: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } });
    }
  };

  useEffect(() => {
    loadNutritionData(selectedDate);
  }, [selectedDate]);

  const handleLogNutrition = async () => {
    try {
      const logEntry = {
        ...logData,
        date: formatDate(selectedDate),
        servings: parseFloat(logData.servings)
      };
      
      await axios.post(`${API}/nutrition-logs`, logEntry);
      await loadNutritionData(selectedDate);
      setIsLogDialogOpen(false);
      setLogData({ meal_type: 'breakfast', recipe_id: '', servings: 1 });
      toast.success("Nutrition logged successfully!");
    } catch (error) {
      toast.error("Failed to log nutrition.");
    }
  };

  const getRecipeById = (id) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracking</h1>
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600" data-testid="log-nutrition-btn">
              <Plus className="h-4 w-4 mr-2" />
              Log Nutrition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Nutrition</DialogTitle>
              <DialogDescription>
                Track what you've eaten on {formatDate(selectedDate)}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <Select value={logData.meal_type} onValueChange={(value) => setLogData({...logData, meal_type: value})}>
                  <SelectTrigger data-testid="nutrition-meal-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Recipe</label>
                <Select value={logData.recipe_id} onValueChange={(value) => setLogData({...logData, recipe_id: value})}>
                  <SelectTrigger data-testid="nutrition-recipe-select">
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Servings</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={logData.servings}
                  onChange={(e) => setLogData({...logData, servings: e.target.value})}
                  data-testid="nutrition-servings-input"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLogNutrition} className="bg-green-500 hover:bg-green-600" data-testid="save-nutrition-btn">
                  Log Nutrition
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                data-testid="nutrition-calendar"
              />
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Summary */}
        <div className="lg:col-span-3 space-y-6">
          {/* Daily Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Nutrition Summary - {selectedDate.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600" data-testid="daily-calories">
                    {Math.round(nutritionData?.totals?.calories || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600" data-testid="daily-protein">
                    {Math.round(nutritionData?.totals?.protein || 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600" data-testid="daily-carbs">
                    {Math.round(nutritionData?.totals?.carbs || 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600" data-testid="daily-fats">
                    {Math.round(nutritionData?.totals?.fats || 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Fats</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Log */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Log</CardTitle>
            </CardHeader>
            <CardContent>
              {nutritionData?.logs?.length > 0 ? (
                <div className="space-y-4">
                  {nutritionData.logs.map((log, index) => {
                    const recipe = getRecipeById(log.recipe_id);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="capitalize">
                            {log.meal_type}
                          </Badge>
                          <div>
                            <div className="font-medium" data-testid={`log-recipe-${index}`}>
                              {recipe?.name || 'Unknown Recipe'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {log.servings} servings
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{Math.round(log.calories)} cal</div>
                          <div className="text-sm text-gray-600">
                            P: {Math.round(log.protein)}g | C: {Math.round(log.carbs)}g | F: {Math.round(log.fats)}g
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>No nutrition logged for this date.</p>
                  <Button 
                    className="mt-4 bg-green-500 hover:bg-green-600"
                    onClick={() => setIsLogDialogOpen(true)}
                  >
                    Start Logging
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// AI Assistant Component
const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI cooking assistant. I can help you with recipes, cooking techniques, nutrition advice, and meal planning. What would you like to know?'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`chat-session-${Date.now()}`);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/ai-chat`, {
        session_id: sessionId,
        message: newMessage
      });
      
      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I\'m having trouble responding right now. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <MessageCircle className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900">AI Cooking Assistant</h1>
      </div>
      
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5 text-green-500" />
            <span>Chat with Chef AI</span>
          </CardTitle>
          <CardDescription>
            Ask me anything about cooking, recipes, nutrition, or meal planning!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  data-testid={`message-${index}`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask me about cooking, recipes, nutrition..."
                disabled={isLoading}
                data-testid="chat-input"
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newMessage.trim()}
                className="bg-green-500 hover:bg-green-600"
                data-testid="send-message-btn"
              >
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [recipes, setRecipes] = useState([]);
  const [nutritionData, setNutritionData] = useState(null);

  // Debug function to force re-render
  const handleViewChange = (newView) => {
    console.log('Setting view from', currentView, 'to', newView);
    setCurrentView(newView);
  };

  // Initialize sample data and load recipes
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data if needed
        await axios.post(`${API}/init-sample-data`);
        
        // Load recipes
        const recipesResponse = await axios.get(`${API}/recipes`);
        setRecipes(recipesResponse.data);
        
        // Load today's nutrition data
        const today = new Date().toISOString().split('T')[0];
        try {
          const nutritionResponse = await axios.get(`${API}/nutrition-logs/${today}`);
          setNutritionData(nutritionResponse.data);
        } catch (error) {
          setNutritionData({ date: today, logs: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } });
        }
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error("Failed to load app data. Please refresh the page.");
      }
    };

    initializeApp();
  }, []);

  const renderCurrentView = () => {
    console.log('Current view:', currentView); // Debug log
    
    switch (currentView) {
      case 'recipes':
        return <RecipeManagement key="recipes" recipes={recipes} setRecipes={setRecipes} />;
      case 'meal-planning':
        return <MealPlanning key="meal-planning" recipes={recipes} />;
      case 'nutrition':
        return <NutritionTracking key="nutrition" recipes={recipes} />;
      case 'ai-assistant':
        return <AIAssistant key="ai-assistant" />;
      default:
        return <Dashboard key="dashboard" recipes={recipes} nutritionData={nutritionData} />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navigation currentView={currentView} setCurrentView={setCurrentView} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {renderCurrentView()}
                </main>
                <Toaster position="top-right" />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;