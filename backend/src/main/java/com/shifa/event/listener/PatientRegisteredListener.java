package com.shifa.event.listener;

import com.shifa.event.PatientRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PatientRegisteredListener {

    // Ignoring WhatsAppService for now, as it's not defined
    // private final WhatsAppService whatsAppService;

    @EventListener
    @Async
    public void onPatientRegistered(PatientRegisteredEvent event) {
        // whatsAppService.sendWelcomeMessage(event.getPatient());
    }
}
