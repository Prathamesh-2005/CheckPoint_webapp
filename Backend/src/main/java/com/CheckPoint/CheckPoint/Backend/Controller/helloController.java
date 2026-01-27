package com.CheckPoint.CheckPoint.Backend.Controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins =
        {
                "http://127.0.0.1:5500/","http://localhost:5173/"
        })
public class helloController {
    @GetMapping("/hello")
    public String hello(@RequestParam String name) {
        return "Hello" + name + " !!!!!";
    }
}
