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
    setCheckoutOpen(false);
    setIsPurchased(true);
    toast({
      title: '🎉 Оплата успешна!',
      description: 'Спасибо за покупку! Программы доступны в разделе "Мои покупки"',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">ДМИТРИЙ МАКИН</h1>
          
          <div className="flex items-center gap-4">
            {isPurchased && (
              <Button variant="ghost" className="gap-2">
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
