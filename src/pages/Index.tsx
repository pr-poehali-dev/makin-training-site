import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'strength' | 'basketball' | 'nutrition';
}

interface CartItem extends Program {
  calculatedData?: {
    height: number;
    weight: number;
    age: number;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
}

const programs: Program[] = [
  {
    id: 's1',
    title: 'БАЗОВАЯ СИЛА',
    description: 'Программа для развития базовой силы и мышечной массы. Включает комплексные упражнения со свободными весами.',
    price: 5000,
    category: 'strength'
  },
  {
    id: 's2',
    title: 'СИЛОВАЯ ВЫНОСЛИВОСТЬ',
    description: 'Сочетание силовых тренировок и кардио. Идеально для тех, кто хочет быть сильным и выносливым одновременно.',
    price: 5500,
    category: 'strength'
  },
  {
    id: 's3',
    title: 'МАКСИМАЛЬНАЯ СИЛА',
    description: 'Продвинутая программа для опытных атлетов. Фокус на увеличении максимальных показателей в базовых упражнениях.',
    price: 6000,
    category: 'strength'
  },
  {
    id: 'b1',
    title: 'ТОЧНЫЙ БРОСОК',
    description: 'Техника броска и меткость. Упражнения для развития координации и точности попаданий с различных дистанций.',
    price: 4500,
    category: 'basketball'
  },
  {
    id: 'b2',
    title: 'СКОРОСТЬ И ДРИБЛИНГ',
    description: 'Развитие скоростных качеств и техники ведения мяча. Упражнения для улучшения контроля и маневренности.',
    price: 4800,
    category: 'basketball'
  },
  {
    id: 'b3',
    title: 'ИГРОВОЙ ИНТЕЛЛЕКТ',
    description: 'Тактическая подготовка и понимание игры. Разбор игровых ситуаций и принятие правильных решений на площадке.',
    price: 5200,
    category: 'basketball'
  },
  {
    id: 'n1',
    title: 'НАБОР МАССЫ',
    description: 'Индивидуальный план питания для эффективного набора мышечной массы с расчётом калорий и макронутриентов.',
    price: 3500,
    category: 'nutrition'
  },
  {
    id: 'n2',
    title: 'СУШКА И РЕЛЬЕФ',
    description: 'План питания для снижения процента жира с сохранением мышечной массы. Точный расчёт дефицита калорий.',
    price: 3500,
    category: 'nutrition'
  },
  {
    id: 'n3',
    title: 'СПОРТИВНОЕ ПИТАНИЕ',
    description: 'Программа питания для повышения спортивных показателей. Оптимальное соотношение БЖУ для энергии и восстановления.',
    price: 3800,
    category: 'nutrition'
  }
];

const testimonials = [
  {
    name: 'Александр Петров',
    result: 'Набрал 8 кг мышечной массы за 3 месяца',
    program: 'Базовая сила + Набор массы',
    image: '💪'
  },
  {
    name: 'Мария Иванова',
    result: 'Улучшила меткость бросков на 35%',
    program: 'Точный бросок',
    image: '🏀'
  },
  {
    name: 'Дмитрий Соколов',
    result: 'Сбросил 12 кг, сохранив силовые показатели',
    program: 'Сушка и рельеф',
    image: '⚡'
  }
];

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedNutritionProgram, setSelectedNutritionProgram] = useState<Program | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [myPurchasesOpen, setMyPurchasesOpen] = useState(false);
  const [purchasedPrograms, setPurchasedPrograms] = useState<CartItem[]>([]);
  const [selectedPurchasedProgram, setSelectedPurchasedProgram] = useState<CartItem | null>(null);
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');

  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addToCart = (program: Program) => {
    setCart([...cart, program]);
    toast({
      title: 'Добавлено в корзину',
      description: program.title,
    });
  };

  const openCalculator = (program: Program) => {
    setSelectedNutritionProgram(program);
    setCalculatorOpen(true);
  };

  const calculateAndAddToCart = () => {
    if (!selectedNutritionProgram || !height || !weight || !age) return;

    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);

    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    const calories = Math.round(bmr * 1.5);
    const protein = Math.round(w * 2);
    const fats = Math.round(w * 1);
    const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

    const itemWithData: CartItem = {
      ...selectedNutritionProgram,
      calculatedData: {
        height: h,
        weight: w,
        age: a,
        calories,
        protein,
        fats,
        carbs
      }
    };

    setCart([...cart, itemWithData]);
    setCalculatorOpen(false);
    setHeight('');
    setWeight('');
    setAge('');
    
    toast({
      title: 'Программа рассчитана и добавлена',
      description: `Калории: ${calories} ккал | Белки: ${protein}г | Жиры: ${fats}г | Углеводы: ${carbs}г`,
    });
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  const handlePayment = () => {
    setPurchasedPrograms([...purchasedPrograms, ...cart]);
    setCart([]);
    setCheckoutOpen(false);
    setIsPurchased(true);
    toast({
      title: '🎉 Оплата успешна!',
      description: 'Спасибо за покупку! Программы доступны в разделе "Мои покупки"',
    });
  };

  const getProgramContent = (programId: string) => {
    const content: Record<string, { weeks: string; exercises: string[]; recommendations: string[] }> = {
      's1': {
        weeks: '12 недель',
        exercises: [
          'Приседания со штангой: 4 подхода по 8-12 повторений',
          'Жим штанги лёжа: 4 подхода по 8-12 повторений',
          'Становая тяга: 3 подхода по 6-8 повторений',
          'Жим штанги стоя: 3 подхода по 8-10 повторений',
          'Подтягивания широким хватом: 3 подхода до отказа'
        ],
        recommendations: [
          'Тренировки 3 раза в неделю',
          'Отдых между подходами: 2-3 минуты',
          'Прогрессия нагрузки: +2.5 кг каждую неделю',
          'Обязательная разминка 10-15 минут'
        ]
      },
      's2': {
        weeks: '10 недель',
        exercises: [
          'Круговая тренировка: 5 кругов',
          'Приседания с гирей: 15 повторений',
          'Отжимания с хлопком: 12 повторений',
          'Выпады с гантелями: 10 повторений на ногу',
          'Бёрпи: 15 повторений'
        ],
        recommendations: [
          'Тренировки 4 раза в неделю',
          'Отдых между кругами: 90 секунд',
          'Кардио после силовой: 15-20 минут',
          'Контроль пульса: 130-150 уд/мин'
        ]
      },
      's3': {
        weeks: '16 недель',
        exercises: [
          'Присед со штангой (85-95% от макс): 5x3',
          'Жим лёжа (85-95% от макс): 5x3',
          'Становая тяга (85-95% от макс): 5x2',
          'Подсобка: жим ногами, жим узким хватом',
          'Работа с цепями и резиной'
        ],
        recommendations: [
          'Тренировки 4-5 раз в неделю',
          'Отдых между подходами: 3-5 минут',
          'Периодизация: лёгкая/средняя/тяжёлая недели',
          'Обязательная работа с тренером'
        ]
      },
      'b1': {
        weeks: '8 недель',
        exercises: [
          'Броски с места (разные дистанции): 100 бросков',
          'Броски после движения: 50 бросков',
          'Штрафные броски: 50 бросков',
          'Броски с сопротивлением: 30 бросков',
          'Игровые броски: 20 бросков'
        ],
        recommendations: [
          'Тренировки 5-6 раз в неделю',
          'Анализ техники на видео',
          'Работа над механикой броска',
          'Фиксация статистики попаданий'
        ]
      },
      'b2': {
        weeks: '8 недель',
        exercises: [
          'Дриблинг на месте (обе руки): 5 минут',
          'Слалом между конусами: 10 повторений',
          'Ускорения с ведением: 10x30 метров',
          'Дриблинг в прыжке: 3 подхода по 1 минуте',
          'Двойной шаг с ведением: 20 повторений'
        ],
        recommendations: [
          'Тренировки 4-5 раз в неделю',
          'Работа над слабой рукой',
          'Упражнения на координацию',
          'Тренировки в игровых ситуациях'
        ]
      },
      'b3': {
        weeks: '12 недель',
        exercises: [
          'Разбор игровых комбинаций: видео-анализ',
          'Ситуационные упражнения 2v2, 3v3',
          'Игра в защите: позиционирование',
          'Чтение действий соперника',
          'Принятие решений под давлением'
        ],
        recommendations: [
          'Просмотр игр NBA с анализом',
          'Работа с тренером',
          'Ведение игрового дневника',
          'Участие в спаррингах'
        ]
      },
      'n1': {
        weeks: 'Индивидуально',
        exercises: [],
        recommendations: [
          'Калорийность: расчётная (профицит +300-500 ккал)',
          'Белки: 2г на кг веса',
          'Жиры: 1г на кг веса',
          'Углеводы: остальные калории',
          'Приёмы пищи: 4-5 раз в день',
          'Питьевой режим: 30-40 мл на кг веса',
          'Пример завтрака: овсянка 100г, яйца 3шт, банан',
          'Пример обеда: рис 150г, курица 200г, овощи'
        ]
      },
      'n2': {
        weeks: 'Индивидуально',
        exercises: [],
        recommendations: [
          'Калорийность: расчётная (дефицит -300-500 ккал)',
          'Белки: 2-2.5г на кг веса',
          'Жиры: 0.8-1г на кг веса',
          'Углеводы: сниженные, акцент на утро',
          'Приёмы пищи: 5-6 раз в день',
          'Питьевой режим: 40-50 мл на кг веса',
          'Читмил: 1 раз в неделю',
          'Кардио: 3-4 раза в неделю по 30 минут'
        ]
      },
      'n3': {
        weeks: 'Индивидуально',
        exercises: [],
        recommendations: [
          'Калорийность: расчётная (поддержка)',
          'Белки: 2г на кг веса',
          'Жиры: 1-1.2г на кг веса',
          'Углеводы: акцент на тренировочные дни',
          'Приёмы пищи: 4-5 раз в день',
          'Питание до тренировки: за 1.5-2 часа',
          'Питание после тренировки: в течение 30-60 минут',
          'Добавки: протеин, креатин, BCAA (по желанию)'
        ]
      }
    };
    return content[programId] || { weeks: '', exercises: [], recommendations: [] };
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">ДМИТРИЙ МАКИН</h1>
          
          <div className="flex items-center gap-4">
            {isPurchased && (
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => setMyPurchasesOpen(true)}
              >
                <Icon name="FolderOpen" size={20} />
                МОИ ПОКУПКИ
              </Button>
            )}
            
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Icon name="ShoppingCart" size={24} />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-primary">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Корзина пуста</p>
                  ) : (
                    <>
                      {cart.map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              {item.calculatedData && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.calculatedData.calories} ккал | Б: {item.calculatedData.protein}г | Ж: {item.calculatedData.fats}г | У: {item.calculatedData.carbs}г
                                </p>
                              )}
                              <p className="text-primary font-bold mt-2">{item.price} ₽</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(index)}
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">ИТОГО:</span>
                          <span className="text-2xl font-bold text-primary">{getTotalPrice()} ₽</span>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckout}
                        >
                          ОФОРМИТЬ ЗАКАЗ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
          <h2 className="text-6xl md:text-8xl font-bold text-center mb-12 tracking-tight">
            ПРОГРАММЫ<br />ТРЕНИРОВОК
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              size="lg"
              className="text-xl py-8 px-12 h-auto font-bold"
              onClick={() => scrollToSection('strength')}
            >
              СИЛОВЫЕ
            </Button>
            <Button
              size="lg"
              className="text-xl py-8 px-12 h-auto font-bold"
              onClick={() => scrollToSection('basketball')}
            >
              БАСКЕТБОЛ
            </Button>
            <Button
              size="lg"
              className="text-xl py-8 px-12 h-auto font-bold"
              onClick={() => scrollToSection('nutrition')}
            >
              ПИТАНИЕ
            </Button>
          </div>
        </section>

        <section id="strength" className="py-20 px-6 animate-slide-up">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold mb-12 text-center">СИЛОВАЯ ПОДГОТОВКА</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {programs.filter(p => p.category === 'strength').map(program => (
                <Card key={program.id} className="p-6 hover:border-primary transition-colors">
                  <h3 className="text-2xl font-bold mb-4">{program.title}</h3>
                  <p className="text-muted-foreground mb-6 min-h-[80px]">{program.description}</p>
                  <p className="text-3xl font-bold text-primary mb-6">{program.price} ₽</p>
                  <Button 
                    className="w-full" 
                    onClick={() => addToCart(program)}
                  >
                    ДОБАВИТЬ В КОРЗИНУ
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="basketball" className="py-20 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold mb-12 text-center">БАСКЕТБОЛЬНАЯ ПОДГОТОВКА</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {programs.filter(p => p.category === 'basketball').map(program => (
                <Card key={program.id} className="p-6 hover:border-primary transition-colors">
                  <h3 className="text-2xl font-bold mb-4">{program.title}</h3>
                  <p className="text-muted-foreground mb-6 min-h-[80px]">{program.description}</p>
                  <p className="text-3xl font-bold text-primary mb-6">{program.price} ₽</p>
                  <Button 
                    className="w-full"
                    onClick={() => addToCart(program)}
                  >
                    ДОБАВИТЬ В КОРЗИНУ
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="nutrition" className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold mb-12 text-center">СПОРТИВНОЕ ПИТАНИЕ</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {programs.filter(p => p.category === 'nutrition').map(program => (
                <Card key={program.id} className="p-6 hover:border-primary transition-colors">
                  <h3 className="text-2xl font-bold mb-4">{program.title}</h3>
                  <p className="text-muted-foreground mb-6 min-h-[80px]">{program.description}</p>
                  <p className="text-3xl font-bold text-primary mb-6">{program.price} ₽</p>
                  <Button 
                    className="w-full"
                    onClick={() => openCalculator(program)}
                  >
                    РАССЧИТАТЬ И ДОБАВИТЬ
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold mb-12 text-center">РЕЗУЛЬТАТЫ УЧЕНИКОВ</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 text-center hover:border-primary transition-colors">
                  <div className="text-6xl mb-4">{testimonial.image}</div>
                  <h3 className="text-xl font-bold mb-2">{testimonial.name}</h3>
                  <p className="text-primary font-semibold mb-3">{testimonial.result}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.program}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Калькулятор БЖУ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="height">Рост (см)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
              />
            </div>
            
            <div>
              <Label htmlFor="age">Возраст (лет)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={calculateAndAddToCart}
              disabled={!height || !weight || !age}
            >
              РАССЧИТАТЬ И ДОБАВИТЬ В КОРЗИНУ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={myPurchasesOpen} onOpenChange={setMyPurchasesOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Мои покупки</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {purchasedPrograms.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">У вас пока нет купленных программ</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {purchasedPrograms.map((program, index) => (
                  <Card 
                    key={index} 
                    className="p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedPurchasedProgram(program)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <Icon 
                          name={program.category === 'strength' ? 'Dumbbell' : program.category === 'basketball' ? 'Trophy' : 'Apple'} 
                          size={24} 
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{program.title}</h3>
                        {program.calculatedData && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {program.calculatedData.calories} ккал | Б: {program.calculatedData.protein}г
                          </p>
                        )}
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedPurchasedProgram !== null} onOpenChange={() => setSelectedPurchasedProgram(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPurchasedProgram && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl">{selectedPurchasedProgram.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {selectedPurchasedProgram.calculatedData && (
                  <Card className="p-6 bg-primary/10 border-primary/30">
                    <h3 className="font-bold text-lg mb-4">Ваши индивидуальные показатели</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Рост</p>
                        <p className="text-2xl font-bold">{selectedPurchasedProgram.calculatedData.height} см</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Вес</p>
                        <p className="text-2xl font-bold">{selectedPurchasedProgram.calculatedData.weight} кг</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Возраст</p>
                        <p className="text-2xl font-bold">{selectedPurchasedProgram.calculatedData.age} лет</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Калории</p>
                        <p className="text-2xl font-bold text-primary">{selectedPurchasedProgram.calculatedData.calories}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Белки</p>
                        <p className="text-xl font-bold">{selectedPurchasedProgram.calculatedData.protein}г</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Жиры</p>
                        <p className="text-xl font-bold">{selectedPurchasedProgram.calculatedData.fats}г</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Углеводы</p>
                        <p className="text-xl font-bold">{selectedPurchasedProgram.calculatedData.carbs}г</p>
                      </div>
                    </div>
                  </Card>
                )}

                {(() => {
                  const content = getProgramContent(selectedPurchasedProgram.id);
                  return (
                    <>
                      {content.weeks && (
                        <div>
                          <Badge className="text-sm px-3 py-1">{content.weeks}</Badge>
                        </div>
                      )}

                      {content.exercises.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xl mb-4">Программа тренировок</h3>
                          <div className="space-y-3">
                            {content.exercises.map((exercise, idx) => (
                              <Card key={idx} className="p-4 hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-primary font-bold text-sm">{idx + 1}</span>
                                  </div>
                                  <p className="flex-1">{exercise}</p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {content.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xl mb-4">Рекомендации</h3>
                          <div className="space-y-2">
                            {content.recommendations.map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <Icon name="CheckCircle2" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                <p className="flex-1">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input id="name" placeholder="Иван Иванов" />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ivan@example.com" />
            </div>
            
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" type="tel" placeholder="+7 999 123-45-67" />
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Сумма к оплате:</span>
                <span className="text-2xl font-bold text-primary">{getTotalPrice()} ₽</span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
              >
                <Icon name="CreditCard" size={20} className="mr-2" />
                ОПЛАТИТЬ КАРТОЙ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;