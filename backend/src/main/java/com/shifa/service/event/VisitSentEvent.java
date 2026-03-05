package com.shifa.service.event;

import com.shifa.domain.visit.Visit;
import org.springframework.context.ApplicationEvent;

public class VisitSentEvent extends ApplicationEvent {
    private final Visit visit;

    public VisitSentEvent(Object source, Visit visit) {
        super(source);
        this.visit = visit;
    }

    public Visit getVisit() {
        return visit;
    }
}
