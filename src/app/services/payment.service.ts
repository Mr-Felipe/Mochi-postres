import { Injectable, signal } from '@angular/core';
import { PaymentMethodType } from '../models/mochi.models';

export interface BankOption {
  id: string;
  nombre: string;
  tipo: 'persona' | 'empresa' | 'ambos';
}

export const COLOMBIAN_BANKS: BankOption[] = [
  { id: 'bancolombia', nombre: 'Bancolombia', tipo: 'ambos' },
  { id: 'nequi_pse', nombre: 'Nequi (vía PSE)', tipo: 'persona' },
  { id: 'davivienda', nombre: 'Davivienda', tipo: 'ambos' },
  { id: 'daviplata_pse', nombre: 'Daviplata (vía PSE)', tipo: 'persona' },
  { id: 'banco_bogota', nombre: 'Banco de Bogotá', tipo: 'ambos' },
  { id: 'bbva', nombre: 'BBVA Colombia', tipo: 'ambos' },
  { id: 'banco_occidente', nombre: 'Banco de Occidente', tipo: 'ambos' },
  { id: 'scotiabank', nombre: 'Scotiabank Colpatria', tipo: 'ambos' },
  { id: 'lulo_bank', nombre: 'Lulo Bank', tipo: 'persona' },
  { id: 'nu_bank', nombre: 'Nu Colombia (Cuenta Nu)', tipo: 'persona' }
];

export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  autorizacionCode: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  readonly isProcessing = signal<boolean>(false);

  async processPayment(method: PaymentMethodType, amount: number, details: Record<string, unknown>): Promise<PaymentProcessResult> {
    this.isProcessing.set(true);

    // Simulate real gateway latency
    await new Promise(resolve => setTimeout(resolve, 1800));

    this.isProcessing.set(false);

    const refId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();

    switch (method) {
      case 'pse':
        return {
          success: true,
          transactionId: refId,
          autorizacionCode: authCode,
          message: `Pago PSE aprobado exitosamente desde ${details['banco'] || 'Banco'}.`,
          timestamp: new Date().toISOString()
        };
      case 'nequi':
      case 'daviplata':
        return {
          success: true,
          transactionId: refId,
          autorizacionCode: authCode,
          message: `Transferencia confirmada desde ${method === 'nequi' ? 'Nequi' : 'Daviplata'} (${details['telefono'] || 'Celular'}).`,
          timestamp: new Date().toISOString()
        };
      case 'tarjeta':
        return {
          success: true,
          transactionId: refId,
          autorizacionCode: authCode,
          message: 'Transacción aprobada por la red procesadora de tarjetas (Visa/Mastercard).',
          timestamp: new Date().toISOString()
        };
      case 'contraentrega':
        return {
          success: true,
          transactionId: `COD-${refId}`,
          autorizacionCode: 'PENDIENTE_RECEPCION',
          message: 'Pedido registrado para pago en efectivo contra entrega.',
          timestamp: new Date().toISOString()
        };
      case 'transferencia':
        return {
          success: true,
          transactionId: `TRF-${refId}`,
          autorizacionCode: 'VERIFICACION_MANUAL',
          message: 'Comprobante recibido para verificación por el equipo de MOCHI.',
          timestamp: new Date().toISOString()
        };
    }
  }
}
