import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CupLayer, CupLayerOption, CustomCupConfig, Product } from '../../models/mochi.models';
import { CartService } from '../../services/cart.service';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-custom-cup',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen">
      <!-- Hero -->
      <div class="relative overflow-hidden py-16 sm:py-20" style="background: linear-gradient(135deg, #590E2A 0%, #3A0A1C 100%)">
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span class="inline-block px-4 py-1.5 rounded-full bg-[#D95578]/20 text-[#D95578] text-[10px] font-bold uppercase tracking-widest mb-4 border border-[#D95578]/30">
            ✨ Personalización
          </span>
          <h1 class="text-3xl sm:text-4xl font-serif italic text-[#FDF8F4] font-bold">
            Crea tu Vaso Perfecto
          </h1>
          <p class="text-sm text-[#FDF8F4]/60 mt-3 max-w-lg mx-auto">
            7 capas de sabor. Elige cada una a tu gusto y arma el vaso relleno más delicioso.
          </p>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-16">
        <!-- Progress Steps -->
        <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-sm p-4 sm:p-6 mb-6">
          <div class="flex items-center justify-between relative">
            <!-- Progress Line -->
            <div class="absolute top-4 left-0 right-0 h-0.5 bg-[#E8D8D0] mx-8"></div>
            <div class="absolute top-4 left-0 h-0.5 bg-[#D95578] mx-8 transition-all duration-500"
              [style.width.%]="progressWidth()"></div>

            @for (step of layers(); track step.id; let i = $index) {
              <button (click)="goToStep(i)"
                class="relative z-10 flex flex-col items-center gap-2 cursor-pointer group">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  [class]="currentStep() === i
                    ? 'bg-[#D95578] text-white shadow-lg shadow-[#D95578]/30'
                    : currentStep() > i
                      ? 'bg-[#065F46] text-white'
                      : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'">
                  @if (currentStep() > i) {
                    <span class="material-icons text-sm">check</span>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                  [class]="currentStep() === i ? 'text-[#D95578]' : 'text-[#590E2A]/40'">
                  {{ step.label }}
                </span>
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Layer Selection -->
          <div class="lg:col-span-2">
            @if (currentLayerData(); as layer) {
            <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-sm overflow-hidden">
              <!-- Step Header -->
              <div class="p-5 sm:p-6 border-b border-[#E8D8D0]/50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-[#D95578]/10 text-[#D95578]">
                    <span class="material-icons text-xl">{{ layer.icon }}</span>
                  </div>
                  <div>
                    <h2 class="text-lg font-serif italic text-[#590E2A] font-bold">{{ layer.label }}</h2>
                    <p class="text-xs text-[#590E2A]/50">{{ layer.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Options Grid -->
              <div class="p-5 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (option of layer.options; track option.id) {
                    <button (click)="selectOption(option)"
                      class="p-4 rounded-2xl border-2 text-left transition-all duration-200"
                      [class]="selectedOptionId() === option.id
                        ? 'border-[#D95578] bg-[#D95578]/5 shadow-sm'
                        : 'border-[#E8D8D0] hover:border-[#D95578]/50 bg-white'">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-bold text-[#590E2A]">{{ option.name }}</span>
                        <span class="text-xs font-bold text-[#D95578]">{{ '$' + option.price.toLocaleString('es-CO') }}</span>
                      </div>
                      @if (selectedOptionId() === option.id) {
                        <div class="mt-2 flex items-center gap-1.5">
                          <span class="material-icons text-[#D95578] text-sm">check_circle</span>
                          <span class="text-[10px] font-bold text-[#D95578] uppercase tracking-wider">Seleccionado</span>
                        </div>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="p-5 sm:p-6 border-t border-[#E8D8D0]/50 flex items-center justify-between">
                <button (click)="prevStep()"
                  [disabled]="currentStep() === 0"
                  class="px-5 py-2.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                    bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0] hover:bg-[#E8D8D0]">
                  ← Anterior
                </button>
                @if (currentStep() < layers().length - 1) {
                  <button (click)="nextStep()"
                    [disabled]="!selectedOptionId()"
                    class="px-5 py-2.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                      bg-[#D95578] text-white hover:bg-[#FF6080] shadow-sm">
                    Siguiente →
                  </button>
                } @else {
                  <button (click)="addToCart()"
                    [disabled]="!canAddToCart() || addedToCart()"
                    class="px-6 py-2.5 rounded-full text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                      bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C] shadow-sm">
                    @if (addedToCart()) {
                      ✓ Agregado
                    } @else {
                      🛒 Agregar al Carrito
                    }
                  </button>
                }
              </div>
            </div>
            } @else {
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-sm p-8 text-center">
                <div class="w-10 h-10 border-3 border-[#D95578] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-sm text-[#590E2A]/50">Cargando opciones...</p>
              </div>
            }
          </div>

          <!-- Cup Preview Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-sm p-5 sm:p-6 sticky top-24">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold mb-4">Tu Vaso</h3>

              <!-- Visual Cup -->
              <div class="flex flex-col items-center gap-0 mb-6">
                <!-- Topping (Capa 7) -->
                <div class="w-32 h-6 rounded-t-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                  [class]="config().topping ? 'bg-[#8B4513] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'"
                  style="border-radius: 4px 4px 0 0">
                  {{ config().topping?.name || '?' }}
                </div>
                <!-- Relleno (Capa 6) -->
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().relleno ? 'bg-[#FF6B6B] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().relleno?.name || '?' }}
                </div>
                <!-- Crema (Capa 5) -->
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().crema ? 'bg-[#FFEAA7] text-[#590E2A]' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().crema?.name || '?' }}
                </div>
                <!-- Base (Capa 4) -->
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().base ? 'bg-[#D4A574] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().base?.name || '?' }}
                </div>
                <!-- Relleno (Capa 3) -->
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().relleno ? 'bg-[#FF6B6B] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().relleno?.name || '?' }}
                </div>
                <!-- Crema (Capa 2) -->
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().crema ? 'bg-[#FFEAA7] text-[#590E2A]' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().crema?.name || '?' }}
                </div>
                <!-- Base (Capa 1) -->
                <div class="w-32 h-5 rounded-b-lg flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().base ? 'bg-[#D4A574] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().base?.name || '?' }}
                </div>
              </div>

              <!-- Layer Summary -->
              <div class="space-y-2 mb-6">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50">🔸 Base (Capas 1 y 4)</span>
                  <span class="font-bold text-[#590E2A]">{{ config().base ? '$' + config().base!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50">🔸 Crema (Capas 2 y 5)</span>
                  <span class="font-bold text-[#590E2A]">{{ config().crema ? '$' + config().crema!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50">🔸 Relleno (Capas 3 y 6)</span>
                  <span class="font-bold text-[#590E2A]">{{ config().relleno ? '$' + config().relleno!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50">🔸 Topping (Capa 7)</span>
                  <span class="font-bold text-[#590E2A]">{{ config().topping ? '$' + config().topping!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
              </div>

              <!-- Total -->
              <div class="border-t border-[#E8D8D0] pt-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-[#590E2A]">Total</span>
                  <div class="text-right">
                    @if (quantity() > 1) {
                      <span class="text-xs text-[#590E2A]/50 block">{{ quantity() }} × {{ '$' + cupTotal().toLocaleString('es-CO') }}</span>
                    }
                    <span class="text-xl font-serif italic text-[#D95578] font-bold">{{ '$' + cupTotalDisplay().toLocaleString('es-CO') }}</span>
                  </div>
                </div>
              </div>

              <!-- Quantity (only at step 3) -->
              @if (currentStep() === 3) {
                <div class="mt-4 flex items-center gap-3">
                  <span class="text-xs font-bold text-[#590E2A]">Cantidad:</span>
                  <div class="flex items-center gap-2 bg-[#FDF8F4] rounded-full border border-[#E8D8D0] px-1">
                    <button (click)="decrementQty()" class="w-8 h-8 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#E8D8D0] transition-colors">
                      <span class="material-icons text-sm">remove</span>
                    </button>
                    <span class="text-sm font-bold text-[#590E2A] w-6 text-center">{{ quantity() }}</span>
                    <button (click)="incrementQty()" class="w-8 h-8 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#E8D8D0] transition-colors">
                      <span class="material-icons text-sm">add</span>
                    </button>
                  </div>
                </div>

                <!-- Add to Cart Button (mobile) -->
                <button (click)="addToCart()"
                  [disabled]="!canAddToCart() || addedToCart()"
                  class="mt-4 w-full py-3 rounded-full text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                    bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C] shadow-sm lg:hidden">
                  @if (addedToCart()) {
                    ✓ Agregado
                  } @else {
                    🛒 Agregar al Carrito
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomCupComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  currentStep = signal(0);
  quantity = signal(1);
  addedToCart = signal(false);
  layers = signal<CupLayer[]>([]);

  config = signal<CustomCupConfig>({
    base: null,
    crema: null,
    relleno: null,
    topping: null
  });

  async ngOnInit() {
    const { data } = await supabase
      .from('ingredientes')
      .select('id, nombre, tipo, precio')
      .eq('activo', true)
      .gt('precio', 0)
      .order('tipo')
      .order('nombre');

    if (!data) return;

    const tipoMap: Record<string, { label: string; description: string; icon: string }> = {
      base: { label: 'Base', description: 'Capas 1 y 4 — La base crujiente de tu vaso', icon: 'cookie' },
      crema: { label: 'Crema', description: 'Capas 2 y 5 — Crema de leche tipo ganache', icon: 'water_drop' },
      relleno: { label: 'Relleno', description: 'Capas 3 y 6 — El corazón de sabor', icon: 'jam' },
      topping: { label: 'Topping (Opcional)', description: 'Capa 7 — La corona de tu creación', icon: 'star' }
    };

    const tipoOrder = ['base', 'crema', 'relleno', 'topping'];
    const grouped: Record<string, CupLayerOption[]> = { base: [], crema: [], relleno: [], topping: [] };

    for (const row of data) {
      const tipo = row.tipo as string;
      if (grouped[tipo]) {
        grouped[tipo].push({ id: String(row.id), name: row.nombre, price: Number(row.precio) });
      }
    }

    const built: CupLayer[] = tipoOrder
      .filter(t => grouped[t].length > 0)
      .map((t, idx) => ({
        id: idx,
        label: tipoMap[t].label,
        description: tipoMap[t].description,
        icon: tipoMap[t].icon,
        options: grouped[t]
      }));

    this.layers.set(built);
  }

  currentLayerData = computed(() => this.layers()[this.currentStep()]);

  selectedOptionId = computed(() => {
    const step = this.currentStep();
    const cfg = this.config();
    switch (step) {
      case 0: return cfg.base?.id || null;
      case 1: return cfg.crema?.id || null;
      case 2: return cfg.relleno?.id || null;
      case 3: return cfg.topping?.id || null;
      default: return null;
    }
  });

  progressWidth = computed(() => {
    const len = this.layers().length;
    return len > 0 ? ((this.currentStep() + 1) / len) * 100 : 0;
  });

  cupTotal = computed(() => {
    const cfg = this.config();
    let total = 0;
    if (cfg.base) total += cfg.base.price;
    if (cfg.crema) total += cfg.crema.price;
    if (cfg.relleno) total += cfg.relleno.price;
    if (cfg.topping) total += cfg.topping.price;
    return total;
  });

  cupTotalDisplay = computed(() => this.cupTotal() * this.quantity());

  allSelected = computed(() => {
    const cfg = this.config();
    return !!(cfg.base && cfg.crema && cfg.relleno && cfg.topping);
  });

  canAddToCart = computed(() => {
    const cfg = this.config();
    return !!(cfg.base && cfg.crema && cfg.relleno);
  });

  selectOption(option: CupLayerOption) {
    const step = this.currentStep();
    this.config.update(cfg => {
      const updated = { ...cfg };
      switch (step) {
        case 0: updated.base = option; break;
        case 1: updated.crema = option; break;
        case 2: updated.relleno = option; break;
        case 3: updated.topping = option; break;
      }
      return updated;
    });
  }

  nextStep() {
    if (this.currentStep() < this.layers().length - 1 && this.selectedOptionId()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(index: number) {
    if (index <= this.currentStep() || this.hasCompletedStep(index - 1)) {
      this.currentStep.set(index);
    }
  }

  private hasCompletedStep(stepIndex: number): boolean {
    const cfg = this.config();
    switch (stepIndex) {
      case -1: return true;
      case 0: return !!cfg.base;
      case 1: return !!cfg.crema;
      case 2: return !!cfg.relleno;
      default: return false;
    }
  }

  incrementQty() {
    this.quantity.update(q => q + 1);
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    if (!this.canAddToCart()) return;

    const cfg = this.config();
    const parts = [
      cfg.base!.name,
      cfg.crema!.name,
      cfg.relleno!.name,
      ...(cfg.topping ? [cfg.topping.name] : [])
    ];

    const GENERIC_CUSTOM_CUP_ID = 25;

    const customProduct: Product = {
      id: GENERIC_CUSTOM_CUP_ID,
      nombre_japones: 'Vaso Personalizado',
      nombre_espanol: `Vaso: ${parts.join(' + ')}`,
      descripcion: `Base: ${cfg.base!.name} | Crema: ${cfg.crema!.name} | Relleno: ${cfg.relleno!.name}${cfg.topping ? ' | Topping: ' + cfg.topping.name : ''}`,
      precio: 0,
      imagen_principal: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
      galeria_imagenes: [],
      disponible: true,
      stock: 9999,
      stock_minimo: 10,
      stock_maximo: 9999,
      calificacion: 0,
      num_resenas: 0
    };

    const layerConfig = {
      base: parseInt(cfg.base!.id),
      crema: parseInt(cfg.crema!.id),
      relleno: parseInt(cfg.relleno!.id),
      topping: cfg.topping ? parseInt(cfg.topping.id) : 0
    };

    this.cartService.addToCart(customProduct, this.quantity(), undefined, layerConfig, this.cupTotal());
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }
}
