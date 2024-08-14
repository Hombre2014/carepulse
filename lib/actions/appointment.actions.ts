'use server';

import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

import { formatDateTime } from '../utils';
import { parseStringify } from '../utils';
import { Appointment } from '@/types/appwrite.types';
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from '../appwrite.config';

export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    return parseStringify(newAppointment);
  } catch (error) {}
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error('An error ocurred while fetching appointment:', error);
  }
};

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        if (appointment.status === 'scheduled') {
          acc.scheduledCount++;
        } else if (appointment.status === 'pending') {
          acc.pendingCount++;
        } else if (appointment.status === 'cancelled') {
          acc.cancelledCount++;
        }

        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error('An error ocurred while fetching appointments:', error);
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }

    const smsMessage = `
      Hi, it's CarePulse.
      ${
        type === 'schedule'
          ? `Your appointment has been scheduled for ${
              formatDateTime(appointment.schedule!).dateTime
            } with Dr. ${appointment.primaryPhysician}.`
          : `We regret to inform you that your appointment for ${
              formatDateTime(appointment.schedule!).dateTime
            } has been cancelled for the following reason: ${
              appointment.cancellationReason
            }.`
      }
      `;

    await sendSMSNotification(userId, smsMessage);

    revalidatePath(`/admin`);

    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error('An error ocurred while updating appointment:', error);
  }
};

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );

    return parseStringify(message);
  } catch (error) {
    console.error('An error ocurred while sending SMS notification:', error);
  }
};
