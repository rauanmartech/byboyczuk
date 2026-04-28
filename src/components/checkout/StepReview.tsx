import React, { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ArrowRight, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const StepReview: React.FC = () => {
  const { data, updateData, prevStep, nextStep } = useCheckout();
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleGoToPayment = async () => {
    try {
      setIsCreatingOrder(true);

      const totalAmount = subtotal + data.shippingPrice;

      // 1. Cria o pedido na tabela `orders`
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          profile_id: user?.id,
          total_amount: totalAmount,
          shipping_cost: data.shippingPrice,
          status: 'pendente',
          payment_method: '',
          payment_status: 'pendente',
          shipping_method: data.shippingMethod,
          shipping_address: {
            street: data.street,
            number: data.number,
            complement: data.complement,
            district: data.district,
            city: data.city,
            state: data.state,
            zip: data.zip,
            customer_name: data.name,
            customer_email: data.email,
            customer_phone: data.phone,
            customer_cpf: data.cpf
          }
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Cria os itens do pedido na tabela `order_items`
      const orderItemsToInsert = items.map(item => ({
        order_id: orderData.id,
        artwork_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Salva o order_id no context para o StepPayment saber qual pedido atualizar
      updateData({ orderId: orderData.id });

      // 4. Avança para a tela de pagamento
      nextStep();
    } catch (e: any) {
      console.error("Erro ao criar pedido:", e);
      toast.error("Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumo Identificação */}
        <div className="p-6 rounded-3xl bg-white border border-border/60">
          <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Seus Dados</h3>
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.email}</p>
          <p className="text-sm text-muted-foreground">{data.phone}</p>
          <p className="text-sm text-muted-foreground">CPF: {data.cpf}</p>
        </div>

        {/* Resumo Entrega */}
        <div className="p-6 rounded-3xl bg-white border border-border/60">
          <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Endereço de Entrega</h3>
          <p className="text-sm text-foreground">{data.street}, {data.number}</p>
          <p className="text-sm text-muted-foreground">{data.complement}</p>
          <p className="text-sm text-muted-foreground">{data.district}</p>
          <p className="text-sm text-muted-foreground">{data.city} - {data.state}</p>
          <p className="text-sm font-medium mt-2">{data.zip}</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex gap-4">
        <Info className="text-primary shrink-0" size={24} />
        <div>
          <p className="text-sm font-semibold text-primary">Pronto para finalizar?</p>
          <p className="text-xs text-primary/70 leading-relaxed">
            Tudo certo com os seus dados? Ao clicar abaixo, você irá para a etapa segura de pagamento.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
        <Button variant="outline" onClick={prevStep} className="w-full sm:w-auto py-6 px-8 rounded-2xl border-2 flex items-center justify-center gap-2">
          <ArrowLeft size={20} />
          <span className="sm:hidden">Voltar</span>
        </Button>
        <Button 
          onClick={handleGoToPayment}
          disabled={isCreatingOrder}
          className="w-full sm:flex-1 py-7 text-lg rounded-2xl shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center relative overflow-hidden"
        >
          {isCreatingOrder ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={22} />
              <span>Preparando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full relative">
              <span className="z-10">Ir para Pagamento</span>
              <ArrowRight size={20} className="absolute right-0 hidden sm:block" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
