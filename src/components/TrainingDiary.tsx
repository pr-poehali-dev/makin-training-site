import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { api, TrainingLog, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface TrainingDiaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const TrainingDiary = ({ open, onOpenChange, user }: TrainingDiaryProps) => {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadLogs();
    }
  }, [open, user]);

  const loadLogs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await api.getTrainingLogs(user.id);
      setLogs(data);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!user || !exerciseName) {
      toast({ title: 'Ошибка', description: 'Введите название упражнения', variant: 'destructive' });
      return;
    }

    setIsAdding(true);
    try {
      await api.addTrainingLog({
        user_id: user.id,
        date,
        exercise_name: exerciseName,
        sets: sets ? parseInt(sets) : undefined,
        reps: reps ? parseInt(reps) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        notes
      });

      toast({ title: 'Успешно', description: 'Запись добавлена в дневник' });
      
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
      
      loadLogs();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, TrainingLog[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Дневник тренировок</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="p-6 bg-primary/5">
            <h3 className="font-bold text-lg mb-4">Добавить запись</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="exercise">Упражнение *</Label>
                <Input
                  id="exercise"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Приседания со штангой"
                />
              </div>

              <div>
                <Label htmlFor="sets">Подходы</Label>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="4"
                />
              </div>

              <div>
                <Label htmlFor="reps">Повторения</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div>
                <Label htmlFor="weight">Вес (кг)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="80"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Как прошла тренировка, самочувствие..."
                  rows={2}
                />
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleAddLog}
              disabled={isAdding || !exerciseName}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              {isAdding ? 'Добавление...' : 'Добавить запись'}
            </Button>
          </Card>

          <div>
            <h3 className="font-bold text-xl mb-4">История тренировок</h3>
            
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Загрузка...</p>
            ) : Object.keys(groupedLogs).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Пока нет записей. Добавьте первую тренировку!
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedLogs)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayLogs]) => (
                    <Card key={date} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Calendar" size={18} className="text-primary" />
                        <h4 className="font-bold">
                          {new Date(date).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {dayLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold">{log.exercise_name}</p>
                              {(log.sets || log.reps || log.weight) && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.sets && `${log.sets} подходов`}
                                  {log.reps && ` × ${log.reps} повторений`}
                                  {log.weight && ` • ${log.weight} кг`}
                                </p>
                              )}
                              {log.notes && (
                                <p className="text-sm mt-2 italic">{log.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDiary;
