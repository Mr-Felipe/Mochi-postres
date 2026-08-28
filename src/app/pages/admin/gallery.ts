import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { supabase } from '../../supabase';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  created_at: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 shadow-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center">
              <span class="material-icons text-[#2E7D32]" style="font-size: 20px">photo_library</span>
            </div>
            <div>
              <h2 class="text-2xl font-serif italic text-[#590E2A] font-bold">Galeria</h2>
              <p class="text-xs text-[#590E2A]/60">Administra las imagenes del sitio</p>
            </div>
          </div>
          <button (click)="fileInput.click()"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#590E2A] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#3A0A1C] transition-colors">
            <span class="material-icons" style="font-size: 16px">cloud_upload</span>
            Subir imagen
          </button>
          <input #fileInput type="file" accept="image/*" multiple (change)="onFilesSelected($event)" class="hidden">
        </div>
      </div>

      <!-- Upload Progress -->
      @if (uploading()) {
        <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-4 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="material-icons animate-spin text-[#D95578]" style="font-size: 20px">refresh</span>
            <div class="flex-1">
              <p class="text-xs font-bold text-[#590E2A]">Subiendo imagenes...</p>
              <p class="text-[10px] text-[#590E2A]/50">{{ uploadProgress() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-4 shadow-xs text-center">
          <span class="text-2xl font-serif italic text-[#590E2A] block">{{ images().length }}</span>
          <span class="text-[10px] text-[#590E2A]/50 uppercase tracking-wider">Imagenes</span>
        </div>
        <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-4 shadow-xs text-center">
          <span class="text-2xl font-serif italic text-[#2C5350] block">{{ totalSizeMB() }}</span>
          <span class="text-[10px] text-[#590E2A]/50 uppercase tracking-wider">MB total</span>
        </div>
        <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-4 shadow-xs text-center">
          <span class="text-2xl font-serif italic text-[#D95578] block">{{ selectedImages().size }}</span>
          <span class="text-[10px] text-[#590E2A]/50 uppercase tracking-wider">Seleccionadas</span>
        </div>
      </div>

      <!-- Bulk Actions -->
      @if (selectedImages().size > 0) {
        <div class="bg-[#590E2A] rounded-[24px] p-4 flex items-center justify-between">
          <span class="text-white text-xs font-bold">{{ selectedImages().size }} seleccionadas</span>
          <div class="flex gap-2">
            <button (click)="clearSelection()"
              class="px-4 py-2 rounded-full bg-white/10 text-white text-[10px] font-bold hover:bg-white/20 transition-colors">
              Cancelar
            </button>
            <button (click)="deleteSelected()"
              class="px-4 py-2 rounded-full bg-[#8C3A3A] text-white text-[10px] font-bold hover:bg-[#6d2f2f] transition-colors flex items-center gap-1.5">
              <span class="material-icons" style="font-size: 14px">delete</span>
              Eliminar
            </button>
          </div>
        </div>
      }

      <!-- Image Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        @for (img of images(); track img.name) {
          <div class="group relative bg-white rounded-2xl border border-[#E8D8D0] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
            (click)="toggleSelect(img.name)"
            [class.ring-2]="selectedImages().has(img.name)"
            [class.ring-[#D95578]]="selectedImages().has(img.name)">

            <!-- Selection checkbox -->
            <div class="absolute top-2 left-2 z-10">
              <div class="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                [class]="selectedImages().has(img.name) ? 'bg-[#D95578] text-white' : 'bg-white/80 text-[#590E2A]/30 group-hover:text-[#590E2A]'">
                <span class="material-icons" style="font-size: 14px">
                  {{ selectedImages().has(img.name) ? 'check' : 'radio_button_unchecked' }}
                </span>
              </div>
            </div>

            <!-- Delete button -->
            <button (click)="deleteImage(img.name, $event)"
              class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-[#8C3A3A]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#8C3A3A]">
              <span class="material-icons" style="font-size: 14px">delete</span>
            </button>

            <!-- Image -->
            <div class="aspect-square bg-[#FDF8F4] flex items-center justify-center overflow-hidden">
              <img [src]="img.url" [alt]="img.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy">
            </div>

            <!-- Info -->
            <div class="p-2.5">
              <p class="text-[10px] font-bold text-[#590E2A] truncate">{{ img.name }}</p>
              <p class="text-[9px] text-[#590E2A]/40">{{ formatSize(img.size) }}</p>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-16 text-center">
            <span class="material-icons text-[#E8D8D0] mb-3" style="font-size: 56px">add_photo_alternate</span>
            <p class="text-sm font-bold text-[#590E2A]/50">No hay imagenes</p>
            <p class="text-[10px] text-[#590E2A]/30 mt-1">Sube imagenes para la galeria del sitio</p>
          </div>
        }
      </div>
    </div>
  `
})
export class GalleryComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

  images = signal<GalleryImage[]>([]);
  uploading = signal(false);
  uploadProgress = signal('');
  selectedImages = signal<Set<string>>(new Set());

  totalSizeMB = signal('0');

  async ngOnInit() {
    await this.loadImages();
  }

  async loadImages() {
    const { data, error } = await supabase.storage
      .from('galeria')
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });

    if (error || !data) {
      console.error('Error loading gallery:', error);
      return;
    }

    const images: GalleryImage[] = [];
    let totalSize = 0;

    for (const file of data) {
      if (file.name === '.emptyFolderPlaceholder') continue;
      const { data: urlData } = supabase.storage
        .from('galeria')
        .getPublicUrl(file.name);
      images.push({
        name: file.name,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        created_at: file.created_at || ''
      });
      totalSize += file.metadata?.size || 0;
    }

    this.images.set(images);
    this.totalSizeMB.set((totalSize / (1024 * 1024)).toFixed(1));
  }

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.uploading.set(true);
    const files = Array.from(input.files);
    let uploaded = 0;

    for (const file of files) {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      this.uploadProgress.set(`${uploaded + 1} de ${files.length}: ${file.name}`);

      const { error } = await supabase.storage
        .from('galeria')
        .upload(fileName, file, { upsert: false });

      if (error) {
        console.error('Upload error:', error);
      }
      uploaded++;
    }

    this.uploading.set(false);
    this.uploadProgress.set('');
    input.value = '';
    await this.loadImages();
  }

  toggleSelect(name: string) {
    const next = new Set(this.selectedImages());
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    this.selectedImages.set(next);
  }

  clearSelection() {
    this.selectedImages.set(new Set());
  }

  async deleteImage(name: string, event: Event) {
    event.stopPropagation();
    const { error } = await supabase.storage.from('galeria').remove([name]);
    if (!error) {
      await this.loadImages();
      this.selectedImages().delete(name);
    }
  }

  async deleteSelected() {
    const names = Array.from(this.selectedImages());
    const { error } = await supabase.storage.from('galeria').remove(names);
    if (!error) {
      this.selectedImages.set(new Set());
      await this.loadImages();
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
