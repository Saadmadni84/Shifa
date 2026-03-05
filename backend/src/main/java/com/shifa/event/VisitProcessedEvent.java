package com.shifa.event;

import com.shifa.domain.visit.Visit;
import org.springframework.context.ApplicationEvent;

public class VisitProcessedEvent extends ApplicationEvent {
    private final Visit visit;

    public VisitProcessedEvent(Object source, Visit visit) {
        super(source);
        this.visit = visit;
    }

    public Visit getVisit() { return visit; }
}
