import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface FoodDiaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

interface FoodLog {
  id: number;
  food_name: string;
  grams: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  created_at: string;
}

interface Goals {
  calories_goal: number;
  protein_goal: number;
  fats_goal: number;
  carbs_goal: number;
}

const API_URL = 'https://functions.poehali.dev/9c96b056-7a2e-4565-a351-26deca2f2098';

export const FoodDiary = ({ open, onOpenChange, user }: FoodDiaryProps) => {
  const [view, setView] = useState<'diary' | 'search' | 'goals'>('diary');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState('100');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [caloriesGoal, setCaloriesGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [fatsGoal, setFatsGoal] = useState('');
  const [carbsGoal, setCarbsGoal] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadGoals();
      loadLogs();
    }
  }, [open, user, date]);

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}?action=get_goals&user_id=${user.id}`);
      const data = await response.json();
      
      if (data.goals) {
        setGoals(data.goals);
        setCaloriesGoal(data.goals.calories_goal.toString());
        setProteinGoal(data.goals.protein_goal.toString());
        setFatsGoal(data.goals.fats_goal.toString());
        setCarbsGoal(data.goals.carbs_goal.toString());
      }
    } catch (error: any) {
      console.error('Error loading goals:', error);
    }
  };

  const loadLogs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?user_id=${user.id}&date=${date}`);
      const data = await response.json();
      setLogs(data.logs);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}?action=search_food&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.foods);
    } catch (error: any) {
      toast({ title: 'Ошибка поиска', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddFood = async () => {
    if (!user || !selectedFood) return;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          date,
          food_name: selectedFood.name,
          grams: parseFloat(grams)
        })
      });
      
      if (!response.ok) throw new Error('Ошибка добавления');
      
      toast({ title: 'Успешно', description: 'Продукт добавлен в дневник' });
      setSelectedFood(null);
      setGrams('100');
      setSearchQuery('');
      setSearchResults([]);
      setView('diary');
      loadLogs();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId })
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      
      toast({ title: 'Успешно', description: 'Запись удалена' });
      loadLogs();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveGoals = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_goals',
          user_id: user.id,
          calories_goal: parseFloat(caloriesGoal),
          protein_goal: parseFloat(proteinGoal),
          fats_goal: parseFloat(fatsGoal),
          carbs_goal: parseFloat(carbsGoal)
        })
      });
      
      if (!response.ok) throw new Error('Ошибка сохранения');
      
      toast({ title: 'Успешно', description: 'Цели обновлены' });
      loadGoals();
      setView('diary');
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const totalCalories = logs.reduce((sum, log) => sum + Number(log.calories), 0);
  const totalProtein = logs.reduce((sum, log) => sum + Number(log.protein), 0);
  const totalFats = logs.reduce((sum, log) => sum + Number(log.fats), 0);
  const totalCarbs = logs.reduce((sum, log) => sum + Number(log.carbs), 0);

  const calculatePreview = () => {
    if (!selectedFood) return null;
    const multiplier = parseFloat(grams) / 100;
    return {
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      fats: Math.round(selectedFood.fats * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10
    };
  };

  const preview = calculatePreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Дневник питания</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={view === 'diary' ? 'default' : 'outline'}
            onClick={() => setView('diary')}
            className="flex-shrink-0 text-sm sm:text-base"
            size="sm"
          >
            <Icon name="Calendar" size={16} className="mr-1 sm:mr-2" />
            Дневник
          </Button>
          <Button
            variant={view === 'search' ? 'default' : 'outline'}
            onClick={() => setView('search')}
            className="flex-shrink-0 text-sm sm:text-base"
            size="sm"
          >
            <Icon name="Search" size={16} className="mr-1 sm:mr-2" />
            Добавить
          </Button>
          <Button
            variant={view === 'goals' ? 'default' : 'outline'}
            onClick={() => setView('goals')}
            className="flex-shrink-0 text-sm sm:text-base"
            size="sm"
          >
            <Icon name="Target" size={16} className="mr-1 sm:mr-2" />
            Цели
          </Button>
        </div>

        {view === 'diary' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {goals && (
              <Card className="p-3 sm:p-4 bg-primary/5">
                <h3 className="font-bold mb-3 text-sm sm:text-base">Прогресс за день</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span>Калории</span>
                      <span className="font-bold">
                        {Math.round(totalCalories)} / {Math.round(goals.calories_goal)} ккал
                      </span>
                    </div>
                    <Progress value={(totalCalories / goals.calories_goal) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Белки</p>
                      <p className="font-bold">{Math.round(totalProtein)}г</p>
                      <p className="text-xs text-muted-foreground">из {Math.round(goals.protein_goal)}г</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Жиры</p>
                      <p className="font-bold">{Math.round(totalFats)}г</p>
                      <p className="text-xs text-muted-foreground">из {Math.round(goals.fats_goal)}г</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Углеводы</p>
                      <p className="font-bold">{Math.round(totalCarbs)}г</p>
                      <p className="text-xs text-muted-foreground">из {Math.round(goals.carbs_goal)}г</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">Съедено сегодня</h3>
              
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Загрузка...</p>
              ) : logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Записей пока нет. Добавьте первый прием пищи!
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id} className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{log.food_name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {log.grams}г • {Math.round(log.calories)} ккал
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">Б: {log.protein.toFixed(1)}г</Badge>
                            <Badge variant="secondary" className="text-xs">Ж: {log.fats.toFixed(1)}г</Badge>
                            <Badge variant="secondary" className="text-xs">У: {log.carbs.toFixed(1)}г</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleDeleteLog(log.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="space-y-4">
            {!selectedFood ? (
              <>
                <div>
                  <Label htmlFor="search" className="text-sm">Поиск продукта</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Курица, рис, яблоко..."
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} size="icon" className="flex-shrink-0">
                      <Icon name="Search" size={18} />
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">Результаты поиска</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {searchResults.map((food, idx) => (
                        <Card
                          key={idx}
                          className="p-3 sm:p-4 cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedFood(food)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm sm:text-base">{food.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {food.calories} ккал на 100г
                              </p>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFood(null)}
                  className="text-sm"
                  size="sm"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад к поиску
                </Button>

                <Card className="p-4 sm:p-6 bg-primary/5">
                  <h3 className="font-bold text-base sm:text-lg mb-4">{selectedFood.name}</h3>
                  
                  <div>
                    <Label htmlFor="grams" className="text-sm">Граммы</Label>
                    <Input
                      id="grams"
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="mt-1 text-lg font-bold"
                    />
                  </div>

                  {preview && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">Питательная ценность:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Калории</p>
                          <p className="text-lg sm:text-xl font-bold text-primary">{preview.calories} ккал</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Белки</p>
                          <p className="text-lg sm:text-xl font-bold">{preview.protein}г</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Жиры</p>
                          <p className="text-lg sm:text-xl font-bold">{preview.fats}г</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Углеводы</p>
                          <p className="text-lg sm:text-xl font-bold">{preview.carbs}г</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Button onClick={handleAddFood} className="w-full" size="lg">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить в дневник
                </Button>
              </div>
            )}
          </div>
        )}

        {view === 'goals' && (
          <div className="space-y-4">
            <Card className="p-4 sm:p-6 bg-primary/5">
              <h3 className="font-bold mb-4 text-sm sm:text-base">Установите дневные цели</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cal-goal" className="text-sm">Калории (ккал)</Label>
                  <Input
                    id="cal-goal"
                    type="number"
                    value={caloriesGoal}
                    onChange={(e) => setCaloriesGoal(e.target.value)}
                    placeholder="2000"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="protein-goal" className="text-xs sm:text-sm">Белки (г)</Label>
                    <Input
                      id="protein-goal"
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(e.target.value)}
                      placeholder="150"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats-goal" className="text-xs sm:text-sm">Жиры (г)</Label>
                    <Input
                      id="fats-goal"
                      type="number"
                      value={fatsGoal}
                      onChange={(e) => setFatsGoal(e.target.value)}
                      placeholder="70"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs-goal" className="text-xs sm:text-sm">Углеводы (г)</Label>
                    <Input
                      id="carbs-goal"
                      type="number"
                      value={carbsGoal}
                      onChange={(e) => setCarbsGoal(e.target.value)}
                      placeholder="250"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveGoals}
                className="w-full mt-6"
                disabled={!caloriesGoal || !proteinGoal || !fatsGoal || !carbsGoal}
                size="lg"
              >
                Сохранить цели
              </Button>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FoodDiary;
