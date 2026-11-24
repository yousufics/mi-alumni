<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! (bool) $user->is_admin) {
            abort(403, 'এই পেজ শুধু অ্যাডমিনের জন্য।');
        }

        return $next($request);
    }
}
