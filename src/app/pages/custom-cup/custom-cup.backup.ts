import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
      <!-- Compact Header -->
      <div class="bg-white border-b border-[#E8D8D0] px-4 py-4 sm:py-5">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#D95578] text-white flex items-center justify-center">
              <span class="material-icons text-xl">local_cafe</span>
            </div>
            <div>
              <h1 class="text-lg font-serif italic text-[#590E2A] font-bold">Arma tu Vaso</h1>
              <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold">Paso {{ currentStep() + 1 }} de {{ layers().length }}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold block">Total</span>
            <span class="text-lg font-serif italic text-[#D95578] font-bold">{{ '$' + cupTotalDisplay().toLocaleString('es-CO') }}</span>
          </div>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-3 h-[calc(100vh-100px)] flex flex-col">

        <!-- Progress Steps -->
        <div class="flex items-center gap-1 mb-3 shrink-0">
          @for (step of layers(); track step.id; let i = $index) {
            <button (click)="goToStep(i)" class="flex-1 group">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                  [class]="currentStep() === i
                    ? 'bg-[#D95578] text-white shadow-lg shadow-[#D95578]/30'
                    : currentStep() > i
                      ? 'bg-[#065F46] text-white'
                      : 'bg-[#E8D8D0] text-[#590E2A]/40'">
                  @if (currentStep() > i) {
                    <span class="material-icons text-sm">check</span>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                  [class]="currentStep() === i ? 'text-[#D95578]' : currentStep() > i ? 'text-[#065F46]' : 'text-[#590E2A]/30'">
                  {{ step.label }}
                </span>
              </div>
              @if (i < layers().length - 1) {
                <div class="h-0.5 mt-4 rounded-full transition-all duration-300"
                  [class]="currentStep() > i ? 'bg-[#065F46]' : 'bg-[#E8D8D0]'"></div>
              }
            </button>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
          <!-- Layer Selection -->
          <div class="lg:col-span-2 flex flex-col min-h-0">
            @if (currentLayerData(); as layer) {
            <div class="bg-white rounded-[28px] border border-[#E8D8D0] shadow-sm overflow-hidden flex flex-col h-full min-h-0">
              <!-- Step Title -->
              <div class="px-5 py-3 border-b border-[#E8D8D0]/50 shrink-0">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#D95578]/10 text-[#D95578] flex items-center justify-center shrink-0">
                    <span class="material-icons text-lg">{{ layer.icon }}</span>
                  </div>
                  <div>
                    <h2 class="text-base font-serif italic text-[#590E2A] font-bold">
                      Seleccione {{ layer.label === 'Topping' ? 'un' : 'una' }} {{ layer.label }}
                    </h2>
                    <p class="text-[10px] text-[#590E2A]/50 leading-tight">{{ layer.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Options Grid (scrollable) -->
              <div class="p-4 flex-1 overflow-y-auto min-h-0">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (option of layer.options; track option.id) {
                    <button (click)="selectOption(option)"
                      class="p-4 rounded-2xl border-2 text-left transition-all duration-200"
                      [class]="selectedOptionId() === option.id
                        ? 'border-[#D95578] bg-[#D95578]/5 shadow-sm'
                        : 'border-[#E8D8D0] hover:border-[#D95578]/40 bg-white'">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-bold text-[#590E2A]">{{ option.name }}</span>
                        <div class="flex items-center gap-1.5">
                          @if (selectedOptionId() === option.id) {
                            <span class="material-icons text-[#D95578] text-sm">check_circle</span>
                          }
                          <span class="text-xs font-bold text-[#D95578]">{{ '$' + option.price.toLocaleString('es-CO') }}</span>
                        </div>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="px-5 py-3 border-t border-[#E8D8D0]/50 flex items-center justify-between shrink-0">
                <button (click)="prevStep()"
                  [disabled]="currentStep() === 0"
                  class="px-5 py-2.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                    bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0] hover:bg-[#E8D8D0]">
                  <span class="material-icons text-sm align-middle mr-1">arrow_back</span> Anterior
                </button>
                @if (currentStep() < layers().length - 1) {
                  <button (click)="nextStep()"
                    [disabled]="!selectedOptionId()"
                    class="px-5 py-2.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                      bg-[#D95578] text-white hover:bg-[#FF6080] shadow-sm">
                    Siguiente <span class="material-icons text-sm align-middle ml-1">arrow_forward</span>
                  </button>
                } @else {
                  <button (click)="addToCart()"
                    [disabled]="!canAddToCart() || addedToCart()"
                    class="px-6 py-2.5 rounded-full text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                      bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C] shadow-sm">
                    @if (addedToCart()) {
                      <span class="material-icons text-sm align-middle mr-1">check</span> Agregado
                    } @else {
                      <span class="material-icons text-sm align-middle mr-1">add_shopping_cart</span> Agregar al Carrito
                    }
                  </button>
                }
              </div>
            </div>
            } @else {
              <div class="bg-white rounded-[28px] border border-[#E8D8D0] shadow-sm p-8 text-center">
                <div class="w-10 h-10 border-3 border-[#D95578] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-sm text-[#590E2A]/50">Cargando opciones...</p>
              </div>
            }
          </div>

          <!-- Cup Preview Sidebar -->
          <div class="lg:col-span-1 flex flex-col min-h-0">
            <div class="bg-white rounded-[28px] border border-[#E8D8D0] shadow-sm p-5 h-full min-h-0">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold mb-4 flex items-center gap-2 shrink-0">
                <span class="material-icons text-[#D95578] text-base">visibility</span> Tu Vaso
              </h3>

              <!-- Visual Cup -->
              <div class="flex flex-col items-center gap-0 mb-4 shrink-0">
                <div class="w-32 h-6 rounded-t-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                  [class]="config().topping ? 'bg-[#8B4513] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'"
                  style="border-radius: 4px 4px 0 0">
                  {{ config().topping?.name || '?' }}
                </div>
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().relleno ? 'bg-[#FF6B6B] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().relleno?.name || '?' }}
                </div>
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().crema ? 'bg-[#FFEAA7] text-[#590E2A]' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().crema?.name || '?' }}
                </div>
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().base ? 'bg-[#D4A574] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().base?.name || '?' }}
                </div>
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().relleno ? 'bg-[#FF6B6B] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().relleno?.name || '?' }}
                </div>
                <div class="w-32 h-5 flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().crema ? 'bg-[#FFEAA7] text-[#590E2A]' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().crema?.name || '?' }}
                </div>
                <div class="w-32 h-5 rounded-b-lg flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                  [class]="config().base ? 'bg-[#D4A574] text-white' : 'bg-[#E8D8D0] text-[#590E2A]/30'">
                  {{ config().base?.name || '?' }}
                </div>
              </div>

              <!-- Layer Summary -->
              <div class="space-y-2 mb-4 shrink-0">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#D4A574]"></span> Base
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ config().base ? '$' + config().base!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#FFEAA7]"></span> Crema
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ config().crema ? '$' + config().crema!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#FF6B6B]"></span> Relleno
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ config().relleno ? '$' + config().relleno!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#590E2A]/50 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#8B4513]"></span> Topping
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ config().topping ? '$' + config().topping!.price.toLocaleString('es-CO') : '—' }}</span>
                </div>
              </div>

              <!-- Quantity (always visible) -->
              <div class="flex items-center justify-between mb-3 shrink-0">
                <span class="text-[11px] font-bold text-[#590E2A]">Cantidad:</span>
                <div class="flex items-center gap-1.5 bg-[#FDF8F4] rounded-full border border-[#E8D8D0] px-1">
                  <button (click)="decrementQty()" class="w-7 h-7 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#E8D8D0] transition-colors">
                    <span class="material-icons text-sm">remove</span>
                  </button>
                  <span class="text-sm font-bold text-[#590E2A] w-5 text-center">{{ quantity() }}</span>
                  <button (click)="incrementQty()" class="w-7 h-7 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#E8D8D0] transition-colors">
                    <span class="material-icons text-sm">add</span>
                  </button>
                </div>
              </div>

              <!-- Total -->
              <div class="border-t border-[#E8D8D0] pt-2 shrink-0">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#590E2A] uppercase tracking-wider">Total</span>
                  <div class="text-right">
                    @if (quantity() > 1) {
                      <span class="text-[9px] text-[#590E2A]/50 block">{{ quantity() }} × {{ '$' + cupTotal().toLocaleString('es-CO') }}</span>
                    }
                    <span class="text-lg font-serif italic text-[#D95578] font-bold">{{ '$' + cupTotalDisplay().toLocaleString('es-CO') }}</span>
                  </div>
                </div>
              </div>

              <!-- Add to Cart Button (mobile) -->
              <button (click)="addToCart()"
                [disabled]="!canAddToCart() || addedToCart()"
                class="mt-3 w-full py-3 rounded-full text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                  bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C] shadow-sm shrink-0 lg:hidden">
                @if (addedToCart()) {
                  <span class="material-icons text-sm align-middle mr-1">check</span> Agregado
                } @else {
                  <span class="material-icons text-sm align-middle mr-1">add_shopping_cart</span> Agregar al Carrito
                }
              </button>
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
  private route = inject(ActivatedRoute);

  currentStep = signal(0);
  quantity = signal(1);
  addedToCart = signal(false);
  layers = signal<CupLayer[]>([]);
  editMode = signal(false);
  isDashboard = signal(false);

  config = signal<CustomCupConfig>({
    base: null,
    crema: null,
    relleno: null,
    topping: null
  });

  async ngOnInit() {
    const url = this.router.url;
    this.isDashboard.set(url.startsWith('/admin') || url.startsWith('/empleado'));

    const { data } = await supabase
      .from('ingredientes')
      .select('id, nombre, tipo, precio')
      .eq('activo', true)
      .gt('precio', 0)
      .order('tipo')
      .order('nombre');

    if (!data) return;

    const tipoMap: Record<string, { label: string; description: string; icon: string }> = {
      base: { label: 'Base', description: 'Elige la base crujiente que sostendrá todas las capas de tu vaso — capas 1 y 4', icon: 'cookie' },
      crema: { label: 'Crema', description: 'Selecciona la crema ganache que dará textura y dulzura — capas 2 y 5', icon: 'water_drop' },
      relleno: { label: 'Relleno', description: 'Elige el corazón de sabor que lleva tu vaso — capas 3 y 6', icon: 'egg' },
      topping: { label: 'Topping', description: 'Corona tu creación con el toque final — capa 7', icon: 'star' }
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

    // Check for edit mode
    const capasStr = this.route.snapshot.queryParamMap.get('capas');
    if (capasStr) {
      this.editMode.set(true);
      try {
        const capas = JSON.parse(capasStr);
        const findOpt = (tipo: string, id: number) => {
          const layer = grouped[tipo];
          return layer.find(o => o.id === String(id)) || null;
        };
        this.config.set({
          base: capas.base ? findOpt('base', capas.base) : null,
          crema: capas.crema ? findOpt('crema', capas.crema) : null,
          relleno: capas.relleno ? findOpt('relleno', capas.relleno) : null,
          topping: capas.topping ? findOpt('topping', capas.topping) : null
        });
        this.currentStep.set(0);
      } catch {}
    }
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
    return !!(cfg.base && cfg.crema && cfg.relleno && cfg.topping);
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
      nombre_japones: 'カスタム',
      nombre_espanol: `Personalizado: ${parts.join(' + ')}`,
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

    if (this.isDashboard()) {
      this.cartService.pendingCustomCup.set({
        product: customProduct,
        cantidad: this.quantity(),
        configuracion_capas: layerConfig,
        customPrice: this.cupTotal()
      });
      this.router.navigate(['/empleado']);
    } else if (this.editMode()) {
      this.router.navigate(['/carrito']);
    } else {
      this.addedToCart.set(true);
      setTimeout(() => this.addedToCart.set(false), 2000);
    }
  }
}
