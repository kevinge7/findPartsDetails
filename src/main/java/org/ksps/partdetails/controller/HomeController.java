package org.ksps.partdetails.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/partsSearch")
    public String redirectToHome() {
        return "redirect:/index.html";
    }
}

