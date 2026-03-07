package com.shifa.service.visit;

import com.shifa.service.exception.InvalidVisitStateException;
import com.shifa.common.enums.VisitStatus;

import java.util.Map;
import java.util.Set;

public final class VisitStatusMachine {

    private static final Map<VisitStatus, Set<VisitStatus>> VALID_TRANSITIONS = Map.of(
            VisitStatus.DRAFT, Set.of(VisitStatus.NOTES_TAKEN),
            VisitStatus.NOTES_TAKEN, Set.of(VisitStatus.AI_PROCESSING, VisitStatus.DRAFT),
            VisitStatus.AI_PROCESSING, Set.of(VisitStatus.REVIEWED, VisitStatus.NOTES_TAKEN),
            VisitStatus.REVIEWED, Set.of(VisitStatus.SENT_TO_PATIENT, VisitStatus.NOTES_TAKEN),
            VisitStatus.SENT_TO_PATIENT, Set.of(VisitStatus.DELIVERED),
            VisitStatus.DELIVERED, Set.of());

    private VisitStatusMachine() {
    }

    public static void transition(VisitStatus current, VisitStatus next) {
        Set<VisitStatus> allowed = VALID_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(next)) {
            throw new InvalidVisitStateException(
                    "Cannot transition visit from " + current + " to " + next +
                            ". Allowed transitions: " + allowed);
        }
    }

    public static boolean canSendToPatient(VisitStatus status) {
        return status == VisitStatus.REVIEWED;
    }

    public static boolean canTriggerAI(VisitStatus status) {
        return status == VisitStatus.NOTES_TAKEN || status == VisitStatus.REVIEWED;
    }
}
