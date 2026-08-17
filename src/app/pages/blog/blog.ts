import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MochiDataService } from '../../services/mochi-data.service';
import { BlogPost } from '../../models/mochi.models';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Header -->
        <div class="bg-white rounded-[40px] p-8 sm:p-12 border border-[#EBE3D5] shadow-xs text-center max-w-3xl mx-auto space-y-3">
          <span class="px-4 py-1.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
            📰 Blog & Cultura Nipo-Colombiana
          </span>
          <h1 class="text-3xl sm:text-5xl font-serif italic text-[#4A3F35]">
            El Arte Detrás del Mochi
          </h1>
          <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider leading-relaxed">
            Noticias, historias de la repostería tradicional japonesa, maridaje de té verde Matcha y novedades de nuestra tienda.
          </p>
        </div>

        <!-- Articles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (post of blogPosts(); track post.id) {
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <div class="h-56 bg-[#FAF7F2] overflow-hidden relative">
                <img [src]="post.imagen" [alt]="post.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-[9px] font-bold uppercase tracking-widest">
                  {{ post.categoria }}
                </span>
              </div>

              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between text-[10px] font-mono text-[#4A3F35]/60 mb-2 uppercase">
                    <span>{{ post.autor }}</span>
                    <span>{{ post.fecha }}</span>
                  </div>

                  <h3 class="text-xl font-serif italic text-[#4A3F35] group-hover:text-[#8C3A3A] transition-colors leading-snug">
                    {{ post.titulo }}
                  </h3>

                  <p class="text-xs text-[#4A3F35]/70 mt-2 leading-relaxed">
                    {{ post.resumen }}
                  </p>
                </div>

                <div class="pt-4 border-t border-[#EBE3D5] flex items-center justify-between">
                  <span class="text-[11px] text-[#4A3F35]/60 font-medium">⏱️ {{ post.tiempoLectura }}</span>
                  <button (click)="selectedPost.set(post)" class="text-xs font-bold uppercase tracking-wider text-[#4A3F35] hover:underline">
                    Leer Artículo Completo →
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Single Post Reader Modal -->
        @if (selectedPost()) {
          @let p = selectedPost()!;
          <div class="fixed inset-0 z-50 bg-[#4A3F35]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white rounded-[40px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 relative border border-[#EBE3D5]">
              <button (click)="selectedPost.set(null)" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#4A3F35] font-bold flex items-center justify-center hover:bg-[#FFD6E0] transition-colors">
                ✕
              </button>

              <span class="px-3.5 py-1.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-xs font-bold font-serif uppercase tracking-wider">
                {{ p.categoria }}
              </span>

              <h2 class="text-2xl sm:text-3xl font-serif italic text-[#4A3F35]">{{ p.titulo }}</h2>
              <div class="text-xs text-[#4A3F35]/60 font-mono">Por {{ p.autor }} • {{ p.fecha }}</div>

              <img [src]="p.imagen" [alt]="p.titulo" class="w-full h-64 object-cover rounded-[24px]">

              <div class="text-[#4A3F35] text-sm leading-relaxed whitespace-pre-line space-y-3 font-sans">
                {{ p.contenido }}
              </div>

              <button (click)="selectedPost.set(null)" class="w-full py-3.5 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest">
                Cerrar Artículo
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class BlogPageComponent {
  dataService = inject(MochiDataService);
  blogPosts = this.dataService.blogPosts;

  selectedPost = signal<BlogPost | null>(null);
}
