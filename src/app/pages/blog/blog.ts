import { Component, inject, signal, ChangeDetectionStrategy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { BlogPost } from '../../models/mochi.models';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Header -->
        <div class="bg-white rounded-[40px] p-8 sm:p-12 border border-[#E8D8D0] shadow-xs text-center max-w-3xl mx-auto space-y-3">
          <span class="px-4 py-1.5 rounded-full bg-[#D95578] text-[#590E2A] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#E8D8D0]">
            📰 Blog & Cultura Nipo-Colombiana
          </span>
          <h1 class="text-3xl sm:text-5xl font-serif italic text-[#590E2A]">
            El Arte Detrás del Mochi
          </h1>
          <p class="text-[#590E2A]/70 text-xs uppercase tracking-wider leading-relaxed">
            Noticias, historias de la repostería tradicional japonesa, maridaje de té verde Matcha y novedades de nuestra tienda.
          </p>
        </div>

        <!-- Articles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (post of blogPosts(); track post.id) {
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <div class="h-56 bg-[#FDF8F4] overflow-hidden relative">
                <img [src]="post.imagen" [alt]="post.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#590E2A] text-[#FDF8F4] text-[9px] font-bold uppercase tracking-widest">
                  {{ post.categoria }}
                </span>
              </div>

              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between text-[10px] font-mono text-[#590E2A]/60 mb-2 uppercase">
                    <span>{{ post.autor }}</span>
                    <span>{{ post.fecha }}</span>
                  </div>

                  <h3 class="text-xl font-serif italic text-[#590E2A] group-hover:text-[#8C3A3A] transition-colors leading-snug">
                    {{ post.titulo }}
                  </h3>

                  <p class="text-xs text-[#590E2A]/70 mt-2 leading-relaxed">
                    {{ post.resumen }}
                  </p>
                </div>

                <div class="pt-4 border-t border-[#E8D8D0] flex items-center justify-between">
                  <span class="text-[11px] text-[#590E2A]/60 font-medium">⏱️ {{ post.tiempoLectura }}</span>
                  <button (click)="selectedPost.set(post)" class="text-xs font-bold uppercase tracking-wider text-[#590E2A] hover:underline">
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
          <div class="fixed inset-0 z-50 bg-[#590E2A]/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
            <div class="bg-white rounded-[40px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl mt-8 sm:mt-16 relative border border-[#E8D8D0]">
              <button (click)="selectedPost.set(null)" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FDF8F4] text-[#590E2A] font-bold flex items-center justify-center hover:bg-[#D95578] transition-colors">
                ✕
              </button>

              <span class="px-3.5 py-1.5 rounded-full bg-[#D95578] text-[#590E2A] text-xs font-bold font-serif uppercase tracking-wider">
                {{ p.categoria }}
              </span>

              <h2 class="text-2xl sm:text-3xl font-serif italic text-[#590E2A]">{{ p.titulo }}</h2>
              <div class="text-xs text-[#590E2A]/60 font-mono">Por {{ p.autor }} • {{ p.fecha }}</div>

              <img [src]="p.imagen" [alt]="p.titulo" class="w-full h-64 object-cover rounded-[24px]">

              <div class="text-[#590E2A] text-sm leading-relaxed whitespace-pre-line space-y-3 font-sans">
                {{ p.contenido }}
              </div>

              <button (click)="selectedPost.set(null)" class="w-full py-3.5 rounded-full bg-[#590E2A] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest">
                Cerrar Artículo
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class BlogPageComponent implements OnInit {
  dataService = inject(MochiDataService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  blogPosts = this.dataService.blogPosts;

  selectedPost = signal<BlogPost | null>(null);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const slug = this.route.snapshot.queryParamMap.get('post');
      if (slug) {
        const posts = this.blogPosts();
        const post = posts.find(p => p.slug === slug);
        if (post) {
          setTimeout(() => this.selectedPost.set(post), 300);
        }
      }
    }
  }
}
